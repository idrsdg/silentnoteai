# 02 — Teknik Mimari

## Stack Kararları

### Neden Electron?

| Kriter | Electron | Tauri | Native |
|--------|----------|-------|--------|
| macOS + Windows tek kod | ✅ | ✅ | ❌ |
| Web stack (TS/React) | ✅ | ❌ (Rust) | ❌ |
| SQLite entegrasyonu | Kolay | Orta | Kolay |
| Sistem ses erişimi | Ek katman | Ek katman | Doğal |
| Öğrenme maliyeti | Düşük | Yüksek | Çok Yüksek |

**Karar: Electron** — mevcut web stack bilgisiyle hızlı geliştirme.

---

## Tam Stack

```
Katman              Teknoloji               Açıklama
─────────────────────────────────────────────────────
Desktop Runtime     Electron 32+            macOS + Windows
UI Framework        React 19 + Vite         Renderer process
Dil                 TypeScript              Tüm kod tabanı
Veritabanı          SQLite (better-sqlite3) Lokal, dosya tabanlı
Ses Yakalama        naudiodon + PortAudio   Cross-platform
Ses Encoding        fluent-ffmpeg           PCM → WAV/WebM
Transkripsiyon      OpenAI Whisper API      Sesi yazıya çevirir
AI Özet             GPT-4o-mini             Özet + action items
Ödeme               Lemon Squeezy           Lisans + ödeme
Build               electron-builder        macOS .dmg, Win .exe
Update              electron-updater        Otomatik güncelleme
Hata Takibi         Sentry                  Crash reporting
```

---

## Sistem Mimarisi

```
┌─────────────────────────────────────────────────────┐
│  Electron Main Process (Node.js)                     │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ SQLite DB   │  │ IPC Handler  │  │ Sistem     │  │
│  │ (notlar,    │  │ (renderer ↔  │  │ Tray       │  │
│  │  transkript)│  │  main köprü) │  │            │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ Audio Worker (ayrı thread)                   │    │
│  │  naudiodon → chunk buffer → ffmpeg encode    │    │
│  │  → Whisper API → transcript → SQLite flush   │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │ contextBridge IPC
┌──────────────────────▼──────────────────────────────┐
│  Renderer Process (React + Vite)                     │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Kayıt    │  │ Geçmiş   │  │ Detay Ekranı       │  │
│  │ Ekranı   │  │ Listesi  │  │ (transkript+özet)  │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                                                      │
│  ┌──────────┐  ┌──────────┐                          │
│  │ Arama    │  │ Ayarlar  │                          │
│  └──────────┘  └──────────┘                          │
└─────────────────────────────────────────────────────┘
```

---

## Ses Yakalama Mimarisi

### MVP: Virtual Audio Device (Hafta 1-8)

```
Zoom/Teams/Meet sesi
        │
        ▼
BlackHole (macOS) / VB-Cable (Windows)
[Kullanıcı ilk kurulumda kurar, rehber verilir]
        │
        ▼
naudiodon → PCM stream
        │
        ▼
30 saniyelik chunk buffer
[VAD ile sessizlik tespiti — gereksiz chunk gönderilmez]
        │
        ▼
fluent-ffmpeg → WAV encode
        │
        ▼
OpenAI Whisper API
        │
        ▼
Transcript string → SQLite
```

### v2: Native Ses Yakalama (Hafta 16+)

```
macOS: ScreenCaptureKit (macOS 13+) → node native addon
Windows: WASAPI Loopback → node native addon
[Kullanıcı herhangi bir şey kurmaz]
```

---

## Veri Modeli (SQLite)

```sql
-- Ana tablo
CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,
  title        TEXT,                  -- AI tarafından üretilir
  started_at   INTEGER,               -- Unix timestamp
  ended_at     INTEGER,
  duration_sec INTEGER,
  transcript   TEXT,                  -- Ham Whisper çıktısı
  summary      TEXT,                  -- GPT özeti
  action_items TEXT,                  -- JSON array ["item1", "item2"]
  tags         TEXT,                  -- JSON array ["proje", "müşteri"]
  created_at   INTEGER
);

-- Tam metin arama
CREATE VIRTUAL TABLE sessions_fts USING fts5(
  title,
  transcript,
  summary,
  action_items,
  content='sessions',
  content_rowid='rowid'
);

-- Trigger: sessions değişince FTS güncelle
CREATE TRIGGER sessions_ai AFTER INSERT ON sessions BEGIN
  INSERT INTO sessions_fts(rowid, title, transcript, summary, action_items)
  VALUES (new.rowid, new.title, new.transcript, new.summary, new.action_items);
END;

-- Ayarlar
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
-- Örnek: api_key (şifreli), language, theme, auto_delete_audio
```

---

## IPC Katmanı (Main ↔ Renderer)

```typescript
// preload.ts — tip güvenli köprü
contextBridge.exposeInMainWorld('api', {
  // Kayıt
  startRecording: () => ipcRenderer.invoke('recording:start'),
  stopRecording:  () => ipcRenderer.invoke('recording:stop'),
  onTranscriptChunk: (cb) => ipcRenderer.on('transcript:chunk', cb),

  // Veritabanı
  getSessions:    (limit, offset) => ipcRenderer.invoke('db:getSessions', limit, offset),
  getSession:     (id) => ipcRenderer.invoke('db:getSession', id),
  searchSessions: (query) => ipcRenderer.invoke('db:search', query),
  deleteSession:  (id) => ipcRenderer.invoke('db:delete', id),

  // Ayarlar
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, val) => ipcRenderer.invoke('settings:set', key, val),
})
```

---

## GPT Prompt Tasarımı

```
System:
Sen bir toplantı asistanısın. Verilen transkriptten:
1. 3-5 maddelik kısa özet
2. Açık action items listesi (kimin ne yapacağı)
3. Toplantı için uygun başlık
üret. JSON formatında döndür.

User:
[Whisper transkripti buraya]

Response format:
{
  "title": "Q1 Satış Değerlendirme Toplantısı",
  "summary": ["Madde 1", "Madde 2", "Madde 3"],
  "action_items": [
    { "task": "Raporu hazırla", "owner": "belirsiz", "deadline": "belirsiz" }
  ]
}
```

---

## Proje Klasör Yapısı (Kod)

```
silent-note-ai-app/
├── src/
│   ├── main/                  ← Electron main process
│   │   ├── index.ts           ← Entry point
│   │   ├── ipc/               ← IPC handler'lar
│   │   ├── audio/             ← Ses yakalama + chunk yönetimi
│   │   ├── ai/                ← Whisper + GPT entegrasyonu
│   │   ├── db/                ← SQLite işlemleri
│   │   └── tray/              ← Sistem tray
│   ├── renderer/              ← React UI
│   │   ├── pages/
│   │   │   ├── Recording.tsx  ← Aktif kayıt ekranı
│   │   │   ├── History.tsx    ← Geçmiş liste
│   │   │   ├── Detail.tsx     ← Transkript + özet
│   │   │   ├── Search.tsx     ← Arama
│   │   │   └── Settings.tsx   ← Ayarlar
│   │   └── components/
│   └── preload/               ← contextBridge
│       └── index.ts
├── electron-builder.yml       ← Build konfigürasyonu
├── package.json
└── tsconfig.json
```
