// POST /api/credentials
// Body: { license_key: string }
// Returns: { openai_key, assemblyai_key, tier, minutes_limit }

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

// ── Tier mapping: Lemon Squeezy variant ID → tier ─────────────────────────────
const VARIANT_TIERS = {
  // Legacy plans (existing customers — mapped automatically)
  '86f794c7-9a13-46b2-93a3-3082f0fc25a3': { tier: 'starter',   minutes_limit: 300  },
  'bdbef23a-5149-479e-89dc-050cf7b5635e': { tier: 'pro',       minutes_limit: 1000 },
  'ccf62ba2-72b4-413f-919a-03dd1a2c1991': { tier: 'unlimited', minutes_limit: -1   },
  // New plans (replace PLACEHOLDER with real variant IDs from LS dashboard)
  'STARTER_VARIANT_ID':   { tier: 'starter',   minutes_limit: 300  },
  'PRO_VARIANT_ID':       { tier: 'pro',       minutes_limit: 1000 },
  'UNLIMITED_VARIANT_ID': { tier: 'unlimited', minutes_limit: -1   },
};

// ── AES-256-CBC encryption helpers ───────────────────────────────────────────
function getEncryptionKey() {
  const secret = process.env.ENCRYPT_SECRET;
  if (!secret) throw new Error('ENCRYPT_SECRET env var not set');
  // Derive 32-byte key from secret
  return createHash('sha256').update(secret).digest();
}

function encrypt(text) {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// ── Vercel KV helpers ─────────────────────────────────────────────────────────
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

// ── Lemon Squeezy license validation ─────────────────────────────────────────
async function validateLicense(licenseKey) {
  const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ license_key: licenseKey }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.valid) return null;
  return data;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { license_key } = req.body ?? {};
  if (!license_key || typeof license_key !== 'string') {
    return res.status(400).json({ error: 'license_key required' });
  }

  const normalizedKey = license_key.trim().toUpperCase();
  const cacheKey = `creds:${normalizedKey}`;

  // 1. Check KV cache (24h)
  const cached = await kvGet(cacheKey);
  if (cached) {
    try {
      return res.status(200).json(JSON.parse(cached));
    } catch {}
  }

  // 2. Validate with Lemon Squeezy
  const lsData = await validateLicense(normalizedKey);
  if (!lsData) {
    return res.status(401).json({ error: 'Invalid or expired license key' });
  }

  // 3. Determine tier from variant ID
  const variantId = lsData.license_key?.variant_id ?? lsData.meta?.variant_id ?? '';
  const tierInfo = VARIANT_TIERS[variantId] ?? { tier: 'starter', minutes_limit: 300 };

  // 4. Build response with encrypted keys
  const openaiKeyRaw  = process.env.OPENAI_API_KEY    ?? '';
  const assemblyKeyRaw = process.env.ASSEMBLYAI_API_KEY ?? '';

  const payload = {
    openai_key:    encrypt(openaiKeyRaw),
    assemblyai_key: encrypt(assemblyKeyRaw),
    tier:          tierInfo.tier,
    minutes_limit: tierInfo.minutes_limit,
  };

  // 5. Cache for 24 hours (86400 seconds)
  await kvSet(cacheKey, JSON.stringify(payload), 86400);

  return res.status(200).json(payload);
}
