import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface NoteData {
  title: string;
  date: number;
  duration_sec: number;
  summary: string[];
  action_items: { task: string; owner: string; deadline: string }[];
  transcript: string;
}

function sanitize(name: string): string {
  return name.replace(/[<>:"/\\|?*\n\r]/g, '').trim().slice(0, 80);
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? (s > 0 ? `${m} dk ${s} sn` : `${m} dk`) : `${s} sn`;
}

export function saveNoteAsText(data: NoteData): string {
  const dir = path.join(os.homedir(), 'Documents', 'Velnot');
  fs.mkdirSync(dir, { recursive: true });

  const dateStr = new Date(data.date).toLocaleString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const datePrefix = new Date(data.date).toISOString().slice(0, 10);
  const safeTitle = sanitize(data.title || 'Başlıksız Toplantı');
  const filename = `${datePrefix} ${safeTitle}.txt`;
  const filePath = path.join(dir, filename);

  const content = [
    `# ${data.title || 'Başlıksız Toplantı'}`,
    `Tarih: ${dateStr}`,
    `Süre: ${formatDuration(data.duration_sec)}`,
    '',
    '## Özet',
    ...data.summary.map(s => `• ${s}`),
    '',
    '## Aksiyonlar',
    ...(data.action_items.length > 0
      ? data.action_items.map(a => `[ ] ${a.task}  —  ${a.owner}  —  ${a.deadline}`)
      : ['(Aksiyon bulunamadı)']),
    '',
    '---',
    '',
    '## Transkript',
    '',
    data.transcript,
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}
