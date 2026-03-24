# 04 — Maliyet Analizi

## Başlangıç Masrafları

### Zorunlu (MVP için)

| Kalem | Maliyet | Açıklama |
|-------|---------|----------|
| Apple Developer Hesabı | $99/yıl | macOS dağıtım + notarization |
| OpenAI API (geliştirme) | ~$20-50 | Test sürecinde Whisper + GPT |
| Domain | $10-15/yıl | Landing page |
| **Toplam** | **~$130-165** | |

### Opsiyonel (Sonradan)

| Kalem | Maliyet | Ne Zaman |
|-------|---------|----------|
| Windows Code Signing (EV sertifika) | $200-300/yıl | Windows'ta Defender uyarısını kaldırmak için |
| Hosting (landing page) | $0 | Vercel free tier yeterli |
| Sentry | $0 | Free tier yeterli (5K hata/ay) |
| Lemon Squeezy komisyonu | %5 + $0.50/işlem | Sadece satış olunca |

---

## API Maliyet Hesabı (Sen Yönetiyorsun)

### Kullanıcı Başına Aylık Maliyet

**Varsayımlar:**
- Haftada 3 toplantı, toplantı başına 1 saat
- Ayda 12 toplantı, toplamda 720 dakika

| Servis | Birim Fiyat | Kullanım | Aylık Maliyet |
|--------|-------------|----------|---------------|
| Whisper API | $0.006/dakika | 720 dakika | $4.32 |
| GPT-4o-mini | ~$0.004/toplantı | 12 toplantı | $0.05 |
| **Toplam** | | | **~$4.40/kullanıcı/ay** |

---

## Fiyatlandırma Senaryoları

### Seçenek A: Aylık Abonelik ($12.99/ay)

| Kullanıcı | API Maliyeti | Gelir | Kar | Kar Marjı |
|-----------|-------------|-------|-----|-----------|
| 10 | $44 | $130 | $86 | %66 |
| 50 | $220 | $650 | $430 | %66 |
| 100 | $440 | $1,299 | $859 | %66 |
| 250 | $1,100 | $3,248 | $2,148 | %66 |
| 500 | $2,200 | $6,495 | $4,295 | %66 |
| 1,000 | $4,400 | $12,990 | $8,590 | %66 |

### Seçenek B: Lifetime License ($99)

| Hesap | Değer |
|-------|-------|
| Kullanıcı başına API maliyeti | $4.40/ay |
| Kaç ayda zarara geçer | 99 ÷ 4.40 = **~22 ay** |
| Güvenli bölge | İlk 22 ayda karda |
| Ortalama kullanım | 12-18 ay (churna göre) |

**22 ay = güvenli sınır.** Kullanıcıların büyük çoğunluğu 22 aydan önce bırakır.

### Seçenek C: Hybrid (Önerilen)

```
Free Trial  : 7 gün (tam özellik)
Monthly     : $12.99/ay
Lifetime    : $99 (limited time offer)
```

---

## Kırılma Noktası Analizi

### Aylık abonelik modelinde masrafları ne zaman karşılar?

| Sabit Gider | Yıllık |
|-------------|--------|
| Apple Developer | $99 |
| Domain | $15 |
| Windows Signing (opsiyonel) | $250 |
| **Toplam sabit** | **~$364/yıl = $30/ay** |

> **Kırılma noktası: 3 ödeme yapan kullanıcı** ($12.99 x 3 = $38.97/ay > $30/ay sabit gider)
> API maliyeti dahil: **7 kullanıcı** ($12.99 x 7 = $90.93 > $30 sabit + $30.80 API)

---

## Alternatif: BYOK Modeli (Kullanıcı Kendi API Key'ini Girer)

| Özellik | Sen Yönet | BYOK |
|---------|-----------|------|
| API maliyeti | $4.40/kullanıcı/ay | $0 |
| Kullanım kolaylığı | Kolay | Zor (OpenAI hesabı lazım) |
| Privacy hikayesi | İyi | Mükemmel |
| Kullanıcı kaybı | Düşük | Yüksek (%60-70 dropout) |
| Fiyat | $12.99/ay | $7.99/ay (sadece app fee) |

**Öneri:** Varsayılan "sen yönet", ayarlardan BYOK seçeneği sun. İkisini bir arada sun.

---

## Gelir Projeksiyonu (Gerçekçi)

| Dönem | Kullanıcı | Aylık Gelir | Not |
|-------|-----------|-------------|-----|
| Lansman haftası | 20-50 satış | - | ProductHunt + HN |
| 1. ay | 30-60 aktif | $390-$780 | |
| 3. ay | 80-150 aktif | $1,040-$1,950 | |
| 6. ay | 150-300 aktif | $1,950-$3,900 | |
| 12. ay | 300-600 aktif | $3,900-$7,800 | |

> Bu rakamlar **dürüst orta senaryo**. Viral olursa x3-5, hiç marketing yapmazsan x0.3.

---

## Maliyet Optimizasyonu İpuçları

1. **GPT-4o-mini kullan, GPT-4o değil** — özet kalitesi %90 aynı, maliyet 15x daha ucuz
2. **Sessizlik tespiti (VAD)** — boş sessizliği Whisper'a gönderme, %20-30 tasarruf
3. **Chunk optimizasyonu** — çok kısa chunk'lardan kaçın (her API çağrısının overhead'i var)
4. **Özet caching** — aynı transkript için özet tekrar üretme
5. **v2'de local Whisper** — API maliyetini tamamen sıfırla, premium özellik olarak sun
