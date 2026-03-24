import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const userDataPath = app.getPath('userData');
    fs.mkdirSync(userDataPath, { recursive: true });
    const dbPath = path.join(userDataPath, 'data.db');
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    migrate(_db);
  }
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id           TEXT PRIMARY KEY,
      title        TEXT,
      started_at   INTEGER,
      ended_at     INTEGER,
      duration_sec INTEGER,
      transcript   TEXT,
      summary      TEXT,
      action_items TEXT,
      tags         TEXT,
      created_at   INTEGER
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS sessions_fts USING fts5(
      title,
      transcript,
      summary,
      action_items,
      content='sessions',
      content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS sessions_ai AFTER INSERT ON sessions BEGIN
      INSERT INTO sessions_fts(rowid, title, transcript, summary, action_items)
      VALUES (new.rowid, new.title, new.transcript, new.summary, new.action_items);
    END;

    CREATE TRIGGER IF NOT EXISTS sessions_ad AFTER DELETE ON sessions BEGIN
      INSERT INTO sessions_fts(sessions_fts, rowid, title, transcript, summary, action_items)
      VALUES ('delete', old.rowid, old.title, old.transcript, old.summary, old.action_items);
    END;

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export interface Session {
  id: string;
  title: string;
  started_at: number;
  ended_at: number;
  duration_sec: number;
  transcript: string;
  summary: string;       // JSON string: string[]
  action_items: string;  // JSON string: {task,owner,deadline}[]
  tags: string;          // JSON string: string[]
  created_at: number;
}

export type NewSession = Omit<Session, 'id' | 'created_at'>;

export function insertSession(session: NewSession): Session {
  const db = getDb();
  const id = crypto.randomUUID();
  const created_at = Date.now();
  db.prepare(`
    INSERT INTO sessions (id, title, started_at, ended_at, duration_sec, transcript, summary, action_items, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, session.title, session.started_at, session.ended_at,
    session.duration_sec, session.transcript, session.summary,
    session.action_items, session.tags, created_at
  );
  return { ...session, id, created_at };
}

export function getSessions(limit = 50, offset = 0): Session[] {
  return getDb()
    .prepare('SELECT * FROM sessions ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as Session[];
}

export function getSession(id: string): Session | undefined {
  return getDb()
    .prepare('SELECT * FROM sessions WHERE id = ?')
    .get(id) as Session | undefined;
}

export function searchSessions(query: string): Session[] {
  if (!query.trim()) return getSessions();
  // Escape special FTS characters
  const escaped = query.replace(/["*]/g, '');
  return getDb().prepare(`
    SELECT s.* FROM sessions s
    INNER JOIN sessions_fts f ON s.rowid = f.rowid
    WHERE sessions_fts MATCH ?
    ORDER BY s.created_at DESC
  `).all(`"${escaped}"*`) as Session[];
}

export function deleteSession(id: string): void {
  getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}
