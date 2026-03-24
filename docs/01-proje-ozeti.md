# 01 — Proje Özeti

## Problem

Yoğun profesyoneller toplantılarda ve görüşmelerde önemli bilgileri kaçırıyor. Mevcut çözümler:
- Karşı tarafa bildirim gönderiyor (Otter, Fireflies)
- Düşük kaliteli transkript üretiyor
- Manuel not almayı gerektiriyor
- Buluta ses yüklüyor (gizlilik riski)

**Boşluk:** Özel, her zaman hazır, sessiz bir kişisel not asistanı yok.

---

## Çözüm

Silent Note AI — masaüstünde çalışan, sistem sesini arka planda yakalayan, Whisper ile transkribe eden ve GPT ile özetleyen bir uygulama.

Karşı tarafa hiçbir bildirim gitmiyor. Notlar bilgisayarında kalıyor.

---

## Hedef Kitle

**Birincil:** White-collar profesyoneller
- Customer Success Managers (CSM)
- Danışmanlar ve freelancerlar
- Proje yöneticileri
- Satış temsilcileri
- Avukatlar ve muhasebeciler

**Ortak özellik:** Haftada 5+ toplantı, not almak için zamanı yok veya dikkatini dağıtmak istemiyor.

---

## Özellikler

### MVP (v1.0)

| # | Özellik | Açıklama |
|---|---------|----------|
| 1 | Görünmez kayıt | Sistem sesi + mikrofon, karşı tarafa bildirim yok |
| 2 | Otomatik transkripsiyon | Whisper API, Türkçe dahil 50+ dil |
| 3 | AI özet | GPT-4o-mini ile 3-5 maddelik özet |
| 4 | Action items | Yapılacaklar listesi otomatik çıkarılır |
| 5 | Lokal arşiv | SQLite, tam metin arama |
| 6 | Sistem tray | Tek tıkla başlat/durdur |
| 7 | Otomatik başlık | Toplantı başlığı AI tarafından üretilir |

### v2.0 (Sonraki Aşama)

| # | Özellik | Açıklama |
|---|---------|----------|
| 1 | Lokal Whisper | İnternet gerektirmez, tam gizlilik |
| 2 | Native ses yakalama | BlackHole/VB-Cable gerektirmez |
| 3 | Konuşmacı ayrımı | Kim ne söyledi (speaker diarization) |
| 4 | Export | Notion, Obsidian, Markdown, PDF |
| 5 | Takvim entegrasyonu | Google Calendar ile toplantı adı otomatik |
| 6 | Gelişmiş arama | Filtre, tag, tarih aralığı |

---

## Rakip Analizi

| Ürün | Fiyat | Gizlilik | Lokal | Bildirim |
|------|-------|----------|-------|----------|
| **Silent Note AI** | $12.99/ay | Yüksek | Evet | Hayır |
| Otter.ai | $16.99/ay | Düşük | Hayır | Evet |
| Fireflies.ai | $18/ay | Düşük | Hayır | Evet |
| Fathom | Ücretsiz | Orta | Hayır | Evet |
| Notion AI | $10/ay | Orta | Hayır | Manuel |

**Temel USP:** Gizlilik + lokal depolama + bildirim yok kombinasyonu rakiplerde mevcut değil.

---

## Ürün Vizyonu

> "Toplantılarında özgürce konuş. Notları biz hallederiz. Kimseye söylemeden."
