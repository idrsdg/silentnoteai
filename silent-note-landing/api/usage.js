// GET  /api/usage?license_key=...  → { used, limit, remaining }
// POST /api/usage                  body: { license_key, minutes } → { ok, remaining }

// ── KV helpers ────────────────────────────────────────────────────────────────
async function kvGet(key) {
  const url = `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.result ?? null;
}

async function kvSet(key, value, exSeconds) {
  const url = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value, ex: exSeconds }),
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function currentMonth() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Seconds until end of current UTC month (for KV TTL auto-reset)
function secondsUntilEndOfMonth() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return Math.ceil((end - now) / 1000) + 60; // +60s buffer
}

async function getLimit(licenseKey) {
  // Fetch limit from credentials endpoint (or cache it separately)
  // For simplicity: call our own credentials API
  try {
    const origin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://velnot.com';
    const res = await fetch(`${origin}/api/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey }),
    });
    if (!res.ok) return 300; // fallback: starter limit
    const data = await res.json();
    return data.minutes_limit ?? 300;
  } catch {
    return 300;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: return current usage ─────────────────────────────────────────────
  if (req.method === 'GET') {
    const licenseKey = req.query?.license_key;
    if (!licenseKey) return res.status(400).json({ error: 'license_key required' });

    const normalizedKey = String(licenseKey).trim().toUpperCase();
    const kvKey = `usage:${normalizedKey}:${currentMonth()}`;

    const usedRaw = await kvGet(kvKey);
    const used = usedRaw ? parseInt(usedRaw, 10) : 0;
    const limit = await getLimit(normalizedKey);
    const remaining = limit === -1 ? -1 : Math.max(0, limit - used);

    return res.status(200).json({ used, limit, remaining });
  }

  // ── POST: deduct usage ────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { license_key, minutes } = req.body ?? {};
    if (!license_key) return res.status(400).json({ error: 'license_key required' });
    if (typeof minutes !== 'number' || minutes <= 0) {
      return res.status(400).json({ error: 'minutes must be a positive number' });
    }

    const normalizedKey = license_key.trim().toUpperCase();
    const kvKey = `usage:${normalizedKey}:${currentMonth()}`;
    const limit = await getLimit(normalizedKey);

    const usedRaw = await kvGet(kvKey);
    const usedBefore = usedRaw ? parseInt(usedRaw, 10) : 0;

    // Unlimited tier: just record but always allow
    if (limit !== -1 && usedBefore >= limit) {
      return res.status(200).json({ ok: false, remaining: 0, error: 'QUOTA_EXCEEDED' });
    }

    const usedAfter = usedBefore + Math.ceil(minutes);
    await kvSet(kvKey, String(usedAfter), secondsUntilEndOfMonth());

    const remaining = limit === -1 ? -1 : Math.max(0, limit - usedAfter);
    return res.status(200).json({ ok: true, remaining });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
