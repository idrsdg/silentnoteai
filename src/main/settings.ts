import { safeStorage } from 'electron';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

function getSettingsDir(): string {
  const dir = path.join(app.getPath('userData'), 'settings');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function encPath(key: string): string {
  return path.join(getSettingsDir(), `${key}.enc`);
}

export function setSetting(key: string, value: string): void {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(value);
    fs.writeFileSync(encPath(key), encrypted);
  } else {
    fs.writeFileSync(encPath(key) + '.plain', value, 'utf8');
  }
}

export function getSetting(key: string): string | null {
  const enc = encPath(key);
  const plain = enc + '.plain';

  if (fs.existsSync(enc) && safeStorage.isEncryptionAvailable()) {
    try {
      const buf = fs.readFileSync(enc);
      return safeStorage.decryptString(buf);
    } catch {
      return null;
    }
  }

  if (fs.existsSync(plain)) {
    return fs.readFileSync(plain, 'utf8');
  }

  return null;
}
