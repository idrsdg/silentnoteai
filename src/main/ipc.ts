import { ipcMain } from 'electron';
import { getSessions, getSession, searchSessions, deleteSession, insertSession, NewSession } from './db';
import { getSetting, setSetting } from './settings';
import { generateSummary, transcribeBuffer } from './ai';
import { saveNoteAsText, NoteData } from './files';

export function registerIpcHandlers() {
  // ── Database ──────────────────────────────────────────────
  ipcMain.handle('db:getSessions', (_e, limit?: number, offset?: number) => {
    return getSessions(limit, offset);
  });

  ipcMain.handle('db:getSession', (_e, id: string) => {
    return getSession(id);
  });

  ipcMain.handle('db:search', (_e, query: string) => {
    return searchSessions(query);
  });

  ipcMain.handle('db:delete', (_e, id: string) => {
    deleteSession(id);
  });

  ipcMain.handle('db:saveSession', (_e, session: NewSession) => {
    return insertSession(session);
  });

  // ── Settings ──────────────────────────────────────────────
  ipcMain.handle('settings:get', (_e, key: string) => {
    return getSetting(key);
  });

  ipcMain.handle('settings:set', (_e, key: string, value: string) => {
    setSetting(key, value);
  });

  // ── AI ────────────────────────────────────────────────────
  ipcMain.handle('ai:generateSummary', async (_e, transcript: string) => {
    return generateSummary(transcript);
  });

  ipcMain.handle('audio:transcribe', async (_e, audioData: ArrayBuffer, language: string) => {
    return transcribeBuffer(Buffer.from(audioData), language || 'tr');
  });

  ipcMain.handle('file:saveNote', (_e, data: NoteData) => {
    return saveNoteAsText(data);
  });
}
