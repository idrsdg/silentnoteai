# 03 — Geliştirme Planı

## Güncel Durum

### Son Tamamlananlar

- [x] Kayıt sonrası `10s+` oturumlarda live chunk transcript'i anında gösterme
- [x] Kısa kayıtlarda son bekleyen chunk'ı önce işleyip transcript açılışını hızlandırma
- [x] Tam transcript rafinesini arka planda sürdürme
- [x] Speaker diarization sonucunu arka planda session'a zenginleştirme
- [x] Record ekranına `auto + override` transkripsiyon dili seçimi ekleme
- [x] Kayıt durunca session'ı önce `draft` olarak koruma
- [x] Kayıt sonrası `Save / Discard` akışı ekleme
- [x] Kayıt sonrası transcript ve üretilen belgeyi `TXT / MD / PDF / DOCX` olarak indirme
- [x] Transcript alanlarında sağ tık ile `copy selection / copy all / select all` desteği
- [x] Draft session'ları history listesinden gizleme

### Yakın Todo

- [ ] Summary çağrısı için backend warm-up / ilk istek gecikmesini azaltma
- [ ] JSON tabanlı session depolamadan `SQLite + FTS` yapısına geçiş
- [ ] Main process'teki sync dosya IO'ları async hale getirme
- [ ] Kayıt sonrası belge ve transcript için çok dilli çeviri akışı
- [ ] Export sonrası dosyayı uygulama içinden klasörde göster / aç aksiyonu
- [ ] Transcript sonuç ekranına speaker rename akışını taşıma
- [ ] History ve landing metinlerini yeni `draft/save/export` akışıyla hizalama

## Genel Zaman Çizelgesi

```
Hafta 1    → Altyapı kurulumu
Hafta 2-3  → Ses yakalama
Hafta 4-5  → Whisper entegrasyonu
Hafta 6    → GPT özet
Hafta 7-8  → Temel UI + SQLite     ← MVP teslim
Hafta 9-10 → UX polish + build
Hafta 11-12 → Ödeme + lisans
Hafta 13-14 → Beta + lansman       ← Para kazanmaya başla
Hafta 15+  → v2 özellikleri
```

---

## Aşama 0 — Altyapı (Hafta 1)

**Hedef:** Çalışan boş Electron uygulaması, iki platformda derlenebilir.

| Görev | Süre |
|-------|------|
| Electron + Vite + React + TypeScript boilerplate | 4 saat |
| electron-builder konfigürasyonu (macOS .dmg + Win .exe) | 3 saat |
| better-sqlite3 entegrasyonu + migration sistemi | 3 saat |
| IPC katmanı (tip güvenli contextBridge) | 3 saat |
| ESLint + Prettier + Git kurulumu | 2 saat |
| GitHub Actions CI/CD (otomatik build) | 3 saat |
| Windows code signing araştırması | 2 saat |

---

## Aşama 1 — MVP (Hafta 2-8)

### Hafta 2-3: Ses Yakalama

| Görev | Süre |
|-------|------|
| BlackHole (macOS) detect + kurulum rehberi | 8 saat |
| VB-Cable (Windows) detect + kurulum rehberi | 6 saat |
| naudiodon ile ses stream başlatma/durdurma | 8 saat |
| 30 saniyelik chunk buffer sistemi | 6 saat |
| VAD (sessizlik tespiti) — gereksiz chunk gönderilmez | 6 saat |
| Ses seviyesi görselleştirmesi (kayıt sırasında dalgalanma) | 4 saat |
| Cihaz hataları (izin reddi, cihaz kesilmesi) | 4 saat |

### Hafta 4-5: Whisper Entegrasyonu

| Görev | Süre |
|-------|------|
| openai SDK kurulumu | 2 saat |
| fluent-ffmpeg ile WAV encode | 4 saat |
| Chunk upload kuyruğu (rate limit yönetimi) | 8 saat |
| Real-time transcript (UI'a parça parça iletim) | 8 saat |
| API key güvenli depolama (Electron safeStorage) | 4 saat |
| Uzun toplantı yönetimi (chunked + birleştirme) | 6 saat |
| Hata yönetimi (timeout, rate limit, network) | 6 saat |

### Hafta 6: GPT Özet

| Görev | Süre |
|-------|------|
| Prompt mühendisliği (3-5 iterasyon) | 8 saat |
| Action items çıkarma + JSON parse | 4 saat |
| Otomatik toplantı başlığı üretme | 2 saat |
| Streaming response (UI'da yazıyormuş gibi) | 4 saat |
| Token limit yönetimi (çok uzun toplantılar) | 6 saat |

### Hafta 7-8: Temel UI + Depolama

| Görev | Süre |
|-------|------|
| Kayıt ekranı (aktif kayıt görünümü) | 8 saat |
| Geçmiş liste ekranı | 6 saat |
| Detay ekranı (transkript + özet yan yana) | 8 saat |
| Tam metin arama (SQLite FTS5) | 6 saat |
| Sistem tray (başlat/durdur, son kayıt) | 4 saat |
| Ayarlar ekranı (API key, dil, tema) | 6 saat |
| Ses dosyası otomatik silme (gizlilik) | 2 saat |

**MVP Çıktısı:**
- Sistem sesini yakalıyor
- Transkripsiyon + özet + action items
- Lokal SQLite'a kaydediyor
- Arama çalışıyor
- Sistem tray'den kontrol

---

## Aşama 2 — v1.0 Satışa Hazır (Hafta 9-14)

### Hafta 9-10: UX + Platform Build

| Görev | Süre |
|-------|------|
| Onboarding wizard (BlackHole/VB-Cable kurulum adımları) | 12 saat |
| macOS notarization (Apple Developer hesabı gerekli) | 8 saat |
| Windows installer + Defender uyarısı araştırması | 6 saat |
| Auto-updater (electron-updater + GitHub Releases) | 8 saat |
| Sentry crash reporting entegrasyonu | 4 saat |
| Keyboard shortcuts | 3 saat |

### Hafta 11-12: Ödeme + Lisans

| Görev | Süre |
|-------|------|
| Lemon Squeezy hesabı + ürün kurulumu | 3 saat |
| Lisans key doğrulama (offline uyumlu) | 8 saat |
| Trial modu (7 gün veya 10 toplantı) | 6 saat |
| Satın alma akışı (uygulama → browser → geri dön) | 4 saat |
| Lisans aktivasyon/deaktivasyon | 6 saat |
| Webhook (ödeme onayı → lisans aktif) | 5 saat |

### Hafta 13-14: Beta + Lansman

| Görev | Süre |
|-------|------|
| 5-10 beta kullanıcısı + geri bildirim | 15 saat |
| Landing page (Next.js veya Framer) | 8 saat |
| App icon + branding | 4 saat |
| Kurulum kılavuzu / docs | 4 saat |
| ProductHunt launch hazırlığı | 5 saat |

---

## Aşama 3 — v2.0 (Hafta 15+)

| Özellik | Süre | Öncelik |
|---------|------|---------|
| Local Whisper (whisper.cpp) | 3 hafta | Yüksek |
| Native ses yakalama (ScreenCaptureKit/WASAPI) | 2 hafta | Yüksek |
| Export (Notion, Obsidian, PDF, Markdown) | 1 hafta | Yüksek |
| Speaker diarization (kim ne söyledi) | 2 hafta | Orta |
| Google Calendar entegrasyonu | 2 hafta | Orta |
| Gelişmiş arama (tag, tarih filtresi) | 1 hafta | Orta |

---

## Toplam Süre Özeti

| Aşama | Hafta | Kümülatif |
|-------|-------|-----------|
| Altyapı | 1 hafta | 1 hafta |
| MVP | 7 hafta | **8 hafta** |
| v1.0 (satışa hazır) | 6 hafta | **14 hafta** |
| v2.0 | 8-10 hafta | **22-24 hafta** |

> **Not:** Benimle (AI asistan) çalışıldığında kodlama süresi 1-2 haftaya iner.
> Asıl zaman alan: macOS notarization, platform testleri, beta süreçleri.

---

## Minimum Gereksinimler (Başlamadan Önce)

- [ ] Apple Developer hesabı ($99/yıl) — notarization için
- [ ] OpenAI API key — geliştirme testleri için
- [ ] Lemon Squeezy hesabı — ödeme sistemi için
- [ ] GitHub hesabı — CI/CD + releases için
- [ ] macOS cihazı — macOS build için zorunlu
- [ ] Windows VM veya cihazı — Windows testi için
