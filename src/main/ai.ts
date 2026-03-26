declare const __ENCRYPT_SECRET__: string;
import OpenAI from 'openai';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDecipheriv, createHash } from 'node:crypto';
import { getSetting } from './settings';

// ── Backend credential fetch & cache ─────────────────────────────────────────

const CREDENTIALS_URL = 'https://velnot.com/api/credentials';
const USAGE_URL       = 'https://velnot.com/api/usage';

interface Credentials {
  openai_key: string;
  assemblyai_key: string;
  tier: string;
  minutes_limit: number;
  fetchedAt: number; // ms
}

let _credCache: Credentials | null = null;
const CACHE_TTL_MS = 23 * 60 * 60 * 1000; // 23 hours (backend caches 24h)

function decryptKey(encrypted: string, secret: string): string {
  const key = createHash('sha256').update(secret).digest();
  const [ivHex, dataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export async function fetchCredentials(): Promise<Credentials> {
  // Return cache if fresh
  if (_credCache && Date.now() - _credCache.fetchedAt < CACHE_TTL_MS) {
    return _credCache;
  }

  const licenseKey = getSetting('license_key');
  if (!licenseKey) throw new Error('Lisans anahtarı bulunamadı. Lütfen lisansını aktive et.');

  const res = await fetch(CREDENTIALS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ license_key: licenseKey }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Kimlik bilgileri alınamadı: ${res.status} — ${body}`);
  }

  const data = await res.json() as {
    openai_key: string; assemblyai_key: string; tier: string; minutes_limit: number;
  };

  // Decrypt keys (ENCRYPT_SECRET is embedded at build time for desktop app)
  // For Electron: keys arrive already encrypted; we store them as-is and decrypt on use.
  // The secret must match what the server used — store it as a build constant.
  const ENCRYPT_SECRET = __ENCRYPT_SECRET__;

  let openaiKey = data.openai_key;
  let assemblyKey = data.assemblyai_key;
  try {
    openaiKey  = decryptKey(data.openai_key,    ENCRYPT_SECRET);
    assemblyKey = decryptKey(data.assemblyai_key, ENCRYPT_SECRET);
  } catch {
    // If decryption fails (e.g. placeholder secret), use raw — server returns plaintext in dev
  }

  _credCache = {
    openai_key:    openaiKey,
    assemblyai_key: assemblyKey,
    tier:          data.tier,
    minutes_limit: data.minutes_limit,
    fetchedAt:     Date.now(),
  };

  return _credCache;
}

export function invalidateCredentialCache() {
  _credCache = null;
}

// ── Usage reporting ───────────────────────────────────────────────────────────

export async function reportUsage(minutes: number): Promise<{ ok: boolean; remaining: number }> {
  const licenseKey = getSetting('license_key');
  if (!licenseKey) return { ok: false, remaining: 0 };

  try {
    const res = await fetch(USAGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey, minutes }),
    });
    if (!res.ok) return { ok: false, remaining: 0 };
    return await res.json() as { ok: boolean; remaining: number };
  } catch {
    return { ok: false, remaining: 0 };
  }
}

export async function getUsage(): Promise<{ used: number; limit: number; remaining: number }> {
  const licenseKey = getSetting('license_key');
  if (!licenseKey) return { used: 0, limit: 0, remaining: 0 };

  try {
    const url = `${USAGE_URL}?license_key=${encodeURIComponent(licenseKey)}`;
    const res = await fetch(url);
    if (!res.ok) return { used: 0, limit: 0, remaining: 0 };
    return await res.json() as { used: number; limit: number; remaining: number };
  } catch {
    return { used: 0, limit: 0, remaining: 0 };
  }
}

// Estimate audio duration in minutes from buffer size (webm ~128kbps)
function estimateMinutes(audioData: Buffer): number {
  const bytes = audioData.byteLength;
  const estimatedSeconds = bytes / (128 * 1024 / 8); // 128 kbps
  return Math.max(1, Math.ceil(estimatedSeconds / 60));
}

// ── AssemblyAI diarization ────────────────────────────────────────────────────

export interface Utterance { speaker: string; text: string; start: number; end: number; }

export interface DiarizationResult {
  transcript: string;
  utterances: Utterance[];
}

interface AssemblyUtterance { speaker: string; text: string; start: number; end: number; }
interface AssemblyPollResult {
  status: string;
  utterances?: AssemblyUtterance[];
  text?: string;
  error?: string;
}

export async function transcribeWithDiarization(audioData: Buffer, language?: string): Promise<DiarizationResult> {
  const creds = await fetchCredentials();
  const apiKey = creds.assemblyai_key;
  if (!apiKey) throw new Error('AssemblyAI anahtarı alınamadı.');

  // 1. Upload audio
  const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: { authorization: apiKey, 'content-type': 'application/octet-stream' },
    body: audioData,
  });
  if (!uploadRes.ok) {
    const errBody = await uploadRes.text().catch(() => '');
    throw new Error(`AssemblyAI upload hatası: ${uploadRes.status} — ${errBody}`);
  }
  const { upload_url } = await uploadRes.json() as { upload_url: string };

  // 2. Request transcript
  const lang = language && language !== 'auto' ? language : undefined;
  const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: { authorization: apiKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      audio_url: upload_url,
      speaker_labels: true,
      speech_model: 'best',
      speakers_expected: 2,
      ...(lang ? { language_code: lang } : {}),
    }),
  });
  if (!transcriptRes.ok) {
    const errBody = await transcriptRes.text().catch(() => '');
    throw new Error(`AssemblyAI transcript isteği hatası: ${transcriptRes.status} — ${errBody}`);
  }
  const { id } = await transcriptRes.json() as { id: string };

  // 3. Poll until complete
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      headers: { authorization: apiKey },
    });
    const data = await poll.json() as AssemblyPollResult;

    if (data.status === 'completed') {
      // Report usage after successful transcription
      const minutes = estimateMinutes(audioData);
      reportUsage(minutes).catch(() => {}); // fire-and-forget

      if (data.utterances?.length) {
        const utterances: Utterance[] = data.utterances.map(u => ({
          speaker: u.speaker, text: u.text, start: u.start, end: u.end,
        }));
        const transcript = utterances.map(u => `Konuşmacı ${u.speaker}: ${u.text}`).join('\n');
        return { transcript, utterances };
      }
      return { transcript: data.text ?? '', utterances: [] };
    }
    if (data.status === 'error') throw new Error(`AssemblyAI hatası: ${data.error}`);
  }
  throw new Error('AssemblyAI zaman aşımı.');
}

// ── OpenAI Whisper transcription ──────────────────────────────────────────────

async function getClient(): Promise<OpenAI> {
  const creds = await fetchCredentials();
  if (!creds.openai_key) throw new Error('OpenAI anahtarı alınamadı.');
  return new OpenAI({ apiKey: creds.openai_key });
}

export async function transcribeBuffer(audioData: Buffer, language?: string): Promise<DiarizationResult> {
  const client = await getClient();
  const tmpPath = path.join(os.tmpdir(), `sna_${Date.now()}.webm`);
  fs.writeFileSync(tmpPath, audioData);
  try {
    const response = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-1',
      ...(language && language !== 'auto' ? { language } : {}),
    });
    // Report usage
    const minutes = estimateMinutes(audioData);
    reportUsage(minutes).catch(() => {});
    return { transcript: response.text, utterances: [] };
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
}

export async function transcribeChunk(audioData: Buffer, language?: string): Promise<string> {
  const client = await getClient();
  const tmpPath = path.join(os.tmpdir(), `sna_chunk_${Date.now()}.webm`);
  fs.writeFileSync(tmpPath, audioData);
  try {
    const response = await client.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-1',
      ...(language && language !== 'auto' ? { language } : {}),
    });
    return response.text;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
}

// ── AI Summary ────────────────────────────────────────────────────────────────

export interface AISummary {
  title: string;
  summary: string[];
  action_items: { task: string; owner: string; deadline: string }[];
}

export type ProcessMode = 'summary' | 'action_plan' | 'meeting_notes';

const PROMPTS: Record<ProcessMode, string> = {
  summary: `You are a meeting assistant. From the given transcript, produce:
1. A short appropriate title for the meeting
2. A 3-5 bullet point summary
3. An empty action_items list

Respond in the SAME LANGUAGE as the transcript. Reply in JSON:
{
  "title": "...",
  "summary": ["point1", "point2", ...],
  "action_items": []
}`,

  action_plan: `You are a meeting assistant. From the given transcript, produce:
1. A short appropriate title for the meeting
2. An empty summary list
3. All action items (who does what, by when)

Respond in the SAME LANGUAGE as the transcript. Reply in JSON:
{
  "title": "...",
  "summary": [],
  "action_items": [
    { "task": "...", "owner": "...", "deadline": "..." }
  ]
}`,

  meeting_notes: `You are a meeting assistant. Produce professional meeting notes from the transcript.
Include: participants (if mentioned), main agenda items, decisions, next steps.

Respond in the SAME LANGUAGE as the transcript. Reply in JSON:
{
  "title": "...",
  "summary": ["## Agenda\\n item...", "## Decisions\\n item...", "## Next Steps\\n item..."],
  "action_items": []
}`,
};

export async function generateSummary(transcript: string, mode: ProcessMode = 'summary'): Promise<AISummary> {
  const client = await getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: PROMPTS[mode] },
      { role: 'user', content: transcript },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('GPT boş yanıt döndürdü');

  return JSON.parse(content) as AISummary;
}
