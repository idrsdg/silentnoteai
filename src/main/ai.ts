import OpenAI from 'openai';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getSetting } from './settings';

export interface AISummary {
  title: string;
  summary: string[];
  action_items: { task: string; owner: string; deadline: string }[];
}

function getClient(): OpenAI {
  const apiKey = getSetting('api_key');
  if (!apiKey) throw new Error('OpenAI API key ayarlanmamış. Lütfen Ayarlar\'dan ekleyin.');
  return new OpenAI({ apiKey });
}

export async function transcribeBuffer(audioData: Buffer, language?: string): Promise<string> {
  const client = getClient();
  const tmpPath = path.join(os.tmpdir(), `sna_${Date.now()}.webm`);
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

export async function generateSummary(transcript: string): Promise<AISummary> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Sen bir toplantı asistanısın. Verilen transkriptten şunları üret:
1. Toplantı için uygun kısa bir başlık
2. 3-5 maddelik özet (Türkçe)
3. Action items listesi (kimin ne yapacağı, ne zaman)

JSON formatında yanıt ver:
{
  "title": "...",
  "summary": ["madde1", "madde2", ...],
  "action_items": [
    { "task": "...", "owner": "...", "deadline": "..." }
  ]
}`,
      },
      {
        role: 'user',
        content: transcript,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('GPT boş yanıt döndürdü');

  return JSON.parse(content) as AISummary;
}
