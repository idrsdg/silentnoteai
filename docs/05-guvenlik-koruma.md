# 05 — Güvenlik ve Koruma

## 1. Lisans Koruması

### Lisans Sistemi Mimarisi

```
Kullanıcı satın alır (Lemon Squeezy)
        │
        ▼
Webhook → senin backend'in (veya Lemon Squeezy direkt)
        │
        ▼
Lisans key üretilir (örn: SILENT-XXXX-XXXX-XXXX)
        │
        ▼
Kullanıcı uygulamaya girer, lisans key'i yapıştırır
        │
        ▼
Uygulama → Lemon Squeezy API'yi doğrular
        │
  ┌─────┴─────┐
Geçerli     Geçersiz
  │               │
Kilit açılır    Engellenir
  │
Makine ID + key → Electron safeStorage'a kaydedilir
```

### Offline Doğrulama

İnternet olmadan da çalışması için:
1. İlk aktivasyonda sunucudan **imzalı JWT** al (RSA private key ile imzalanmış)
2. JWT'yi `safeStorage` ile şifreli sakla
3. Offline'da JWT'nin imzasını lokal public key ile doğrula
4. JWT'ye expiry koy (30 gün) — 30 günde bir online doğrulama zorunlu

```typescript
// Lisans doğrulama akışı
async function validateLicense(key: string): Promise<boolean> {
  try {
    // Online doğrulama
    const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
      method: 'POST',
      body: JSON.stringify({ license_key: key, instance_name: getMachineId() })
    })
    const data = await res.json()
    if (data.valid) {
      // İmzalı token'ı sakla
      const token = generateSignedToken(key, getMachineId())
      safeStorage.encryptString(token) // → disk'e kaydet
      return true
    }
    return false
  } catch {
    // Offline: lokal token'ı kontrol et
    return validateLocalToken()
  }
}
```

### Makine Bağlama

Lisans key başka bilgisayarda çalışmasın:
- `node-machine-id` ile unique cihaz ID'si üret
- Bu ID aktivasyon sırasında kaydedilir
- Farklı makinede aynı key → Lemon Squeezy'de "instance limit" aktif

---

## 2. Kod Koruması

### Electron'da Kod Koruma

Electron uygulamaları default olarak kaynak kodu görünür. Çözümler:

**Seviye 1: asar arşivi (Temel)**
```
electron-builder otomatik yapar:
  src/ → app.asar (arşiv dosyası, doğrudan okunmaz)

Decompile edilebilir mi? Evet, ama casual kullanıcıyı engeller.
```

**Seviye 2: JavaScript Obfuscation**
```bash
npm install --save-dev javascript-obfuscator
# Build pipeline'a ekle
```
- Değişken isimleri anlamsız hale gelir
- String encryption
- Control flow flattening
- Tersine mühendisliği çok zorlaştırır (imkansız değil)

**Seviye 3: v8 bytecode (Güçlü)**
```
bytenode paketi ile .js → .jsc (V8 bytecode)
Ana iş mantığını bytecode'a çevir
Kaynak kod dağıtıma dahil edilmez
```
```javascript
// build sonrası
const bytenode = require('bytenode')
bytenode.compileFile('dist/main/index.js', 'dist/main/index.jsc')
```

**Önerim:** Seviye 1 + 2 yeterli. Seviye 3 için bytenode karmaşık, Electron güncellemelerinde sorun çıkarabilir.

### Kritik: API Key Koruması

Kullanıcının OpenAI API key'i güvenli saklanmalı:

```typescript
import { safeStorage } from 'electron'

// Kaydet (OS keychain kullanır — macOS Keychain, Windows DPAPI)
function saveApiKey(key: string): void {
  const encrypted = safeStorage.encryptString(key)
  fs.writeFileSync(apiKeyPath, encrypted)
}

// Oku
function getApiKey(): string {
  const encrypted = fs.readFileSync(apiKeyPath)
  return safeStorage.decryptString(encrypted)
}
```

**Kesinlikle yapma:**
- API key'i `.env` dosyasına koyma (kod ile birlikte dağıtılır)
- Plain text olarak localStorage'a yazma
- Hardcode etme

---

## 3. Veri Gizliliği

### Lokal Depolama Güvenliği

```
SQLite dosyası: ~/Library/Application Support/SilentNoteAI/data.db
```

**Şifreleme seçenekleri:**

| Yöntem | Zorluk | Güvenlik |
|--------|--------|----------|
| SQLite plain (default) | Kolay | Düşük (dosya kopyalanabilir) |
| SQLCipher (şifreli SQLite) | Orta | Yüksek |
| Uygulama seviyesi şifreleme | Zor | Orta-Yüksek |

**Öneri:** MVP için plain SQLite yeterli (kullanıcı kendi bilgisayarında). v2'de SQLCipher seçeneği ekle.

### Ses Dosyası Yönetimi

```typescript
// Transkripsiyon biter bitmez sil
async function processAudioChunk(audioPath: string) {
  try {
    const transcript = await whisper.transcribe(audioPath)
    await saveToDb(transcript)
  } finally {
    fs.unlinkSync(audioPath) // Her durumda sil
  }
}
```

Kullanıcıya ayarlar'da seçenek sun:
- "Ses dosyalarını otomatik sil" (default: açık)
- "Ses dosyalarını kaydet" (güç kullanıcılar için)

### Privacy Policy Zorunluluğu

macOS App Store ve notarization için gizlilik politikası zorunlu. Temel maddeler:
- Hangi veriler toplanıyor (hiç toplanmıyor → güçlü USP)
- API key'ler nerede saklanıyor (OS keychain)
- Ses verileri nereye gidiyor (OpenAI API, hemen siliniyor)
- Transkriptler nerede (sadece lokal)

---

## 4. Kötüye Kullanım Önlemleri

### Rate Limiting

Kötü niyetli kullanıcıların API'yi aşırı kullanmasını engelle:

```typescript
// Kullanıcı başına günlük limit
const DAILY_TRANSCRIPTION_LIMIT_MINUTES = 480 // 8 saat

async function checkRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toDateString()
  const usage = await db.getDailyUsage(userId, today)
  return usage < DAILY_TRANSCRIPTION_LIMIT_MINUTES
}
```

### Lisans Kötüye Kullanımı

- Lemon Squeezy'de instance limit: 2 cihaz/lisans
- Şüpheli aktivasyon pattern'ı tespit et (aynı key, 10 farklı IP)
- Kara listeye alma imkanı

---

## 5. macOS Güvenlik Gereksinimleri

### Notarization Süreci

Apple'ın güvenlik taramasından geçmeden macOS'ta çalışmaz (Gatekeeper engeller):

```bash
# 1. Build
electron-builder --mac

# 2. Notarize (Apple'a gönder)
xcrun notarytool submit app.dmg \
  --apple-id your@email.com \
  --password app-specific-password \
  --team-id TEAMID \
  --wait

# 3. Staple (onay damgası ekle)
xcrun stapler staple app.dmg
```

**Gereken izinler (entitlements.plist):**
```xml
<key>com.apple.security.device.audio-input</key><true/>
<key>com.apple.security.device.microphone</key><true/>
<key>com.apple.security.network.client</key><true/>
<!-- v2 için: -->
<key>com.apple.security.screen-capture</key><true/>
```

### macOS Minimum Versiyon

- ScreenCaptureKit (v2 için): macOS 13 Ventura+
- Notarization: macOS 10.15+ hedef
- **Öneri:** Minimum macOS 12 Monterey (piyasanın %85'i artık 12+)

---

## 6. Windows Güvenliği

### SmartScreen Uyarısı

Code signing sertifikası olmadan Windows Defender uyarı verir:

**Çözüm seçenekleri:**
1. **EV Code Signing sertifikası** ($200-300/yıl) — uyarıyı kaldırır, anlık güven
2. **Standard sertifika** ($70-100/yıl) — uyarıyı kaldırmaz başlangıçta, zamanla "reputation" kazanır
3. **Microsoft Store** — kendi signing'ini yapar, %30 komisyon

**Öneri:** Başlangıçta sadece macOS, 6 ay sonra Windows + EV sertifika.

---

## 7. Güvenlik Checklist

### MVP'de Zorunlu
- [ ] API key'leri `safeStorage` ile şifrele
- [ ] Ses dosyalarını transkripsiyon sonrası sil
- [ ] HTTPS'siz API isteği yapma
- [ ] Lisans doğrulamasını bypass edilemez yap
- [ ] macOS notarization tamamla

### v1.0'da Ekle
- [ ] Kod obfuscation (javascript-obfuscator)
- [ ] Rate limiting (günlük kullanım limiti)
- [ ] Crash raporlarında kişisel veri gönderme
- [ ] Privacy policy sayfası

### v2.0'da Ekle
- [ ] SQLCipher (veritabanı şifreleme)
- [ ] Local Whisper (ses hiç API'ye gitmiyor)
- [ ] Audit log (hangi toplantılar kaydedildi)
