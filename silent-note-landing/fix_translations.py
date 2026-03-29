import re

path = r"C:\Users\idris.dag\Desktop\Trivials\Apps\velnot\silent-note-landing\index.html"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)

# ── 1. data-i18n → data-i18n-html for pricing.freeTier (contains <strong>) ──
content = content.replace(
    'data-i18n="pricing.freeTier"',
    'data-i18n-html="pricing.freeTier"'
)

# ── 2. Make price amounts dynamic in HTML ──
content = content.replace(
    '<div class="price-amount">$9.99<span data-i18n="plan.monthly.period">',
    '<div class="price-amount"><span data-i18n="plan.monthly.amount">$10.99</span><span data-i18n="plan.monthly.period">'
)
content = content.replace(
    '<div class="price-amount">$89.99<span data-i18n="plan.yearly.period">',
    '<div class="price-amount"><span data-i18n="plan.yearly.amount">$89.99</span><span data-i18n="plan.yearly.period">'
)
content = content.replace(
    '<div class="price-amount">$199.99<span style="font-size:16px;color:#888;" data-i18n="plan.lifetime.period">',
    '<div class="price-amount"><span data-i18n="plan.lifetime.amount">$219</span><span style="font-size:16px;color:#888;" data-i18n="plan.lifetime.period">'
)

# ── 3. Add plan.monthly/yearly/lifetime.amount to T.en ──
content = content.replace(
    "monthly: { name: 'Monthly', period: '/mo', note: 'billed monthly · cancel anytime' }",
    "monthly: { name: 'Monthly', amount: '$10.99', period: '/mo', note: 'billed monthly · cancel anytime' }"
)
content = content.replace(
    "yearly: { badge: '⭐ Most Popular · 25% off', name: 'Yearly', period: '/yr', note: '$7.50/mo · billed annually' }",
    "yearly: { badge: '⭐ Most Popular · 25% off', name: 'Yearly', amount: '$89.99', period: '/yr', note: '$7.50/mo · billed annually' }"
)
content = content.replace(
    "lifetime: { badge: '♾ Best Value', name: 'Lifetime', period: ' one-time', note: 'pay once, use forever' }",
    "lifetime: { badge: '♾ Best Value', name: 'Lifetime', amount: '$219', period: ' one-time', note: 'pay once, use forever' }"
)

# ── 4. Update compare.pricing in ALL languages ($9.99 → $10.99) ──
replacements_pricing = [
    ("pricing: '✅ $9.99/ay\\'dan'", "pricing: '✅ $10.99/ay\\'dan'"),
    ("pricing: '✅ From $9.99/mo'", "pricing: '✅ From $10.99/mo'"),
    ("pricing: '✅ Desde $9.99/mes'", "pricing: '✅ Desde $10.99/mes'"),
    ("pricing: '✅ À partir de $9.99/mois'", "pricing: '✅ À partir de $10.99/mois'"),
    ("pricing: '✅ Ab $9.99/Monat'", "pricing: '✅ Ab $10.99/Monat'"),
    ("pricing: '✅ A partir de $9.99/mês'", "pricing: '✅ A partir de $10.99/mês'"),
    ("pricing: '✅ 从$9.99/月起'", "pricing: '✅ 从$10.99/月起'"),
    ("pricing: '✅ من $9.99/شهر'", "pricing: '✅ من $10.99/شهر'"),
    ("pricing: '✅ $9.99/माह से'", "pricing: '✅ $10.99/माह से'"),
    ("pricing: '✅ от $9.99/мес'", "pricing: '✅ от $10.99/мес'"),
    ("pricing: '✅ $9.99/月から'", "pricing: '✅ $10.99/月から'"),
    ("pricing: '✅ Dari $9.99/bln'", "pricing: '✅ Dari $10.99/bln'"),
    ("pricing: '✅ $9.99/월부터'", "pricing: '✅ $10.99/월부터'"),
    ("pricing: '✅ $9.99/মাস থেকে'", "pricing: '✅ $10.99/মাস থেকে'"),
]
for old, new in replacements_pricing:
    count = content.count(old)
    if count == 0:
        print(f"WARNING pricing: not found: {old[:60]}")
    else:
        content = content.replace(old, new)
        print(f"OK: {count}x compare.pricing fixed for: {old[:40]}")

# ── 5. Add FAQ q7/a7/q8/a8 to each language ──
faq_additions = [
    # TR
    (
        "adresine iletebilirsin.' },",
        "adresine iletebilirsin.', q7: 'Ücretsiz deneme var mı?', a7: 'Evet. Velnot sana kredi kartı gerekmeden <strong>3 ücretsiz kayıt</strong> hakkı tanır — sadece indir ve başla. Ücretsiz hakkın bitince bir plan seç. Satın alma sonrası lisans key anında e-postayla gönderilir.', q8: 'Hangi dilleri destekliyor?', a8: 'Velnot transkripsiyon için <strong>OpenAI Whisper</strong> kullanır. Türkçe, İngilizce, İspanyolca, Fransızca, Almanca, Arapça, Hintçe, Japonca, Korece, Çince, Endonezce, Portekizce, Rusça, Bengalce dahil <strong>99 dil</strong> desteklenir. AI özeti transkriptle aynı dilde oluşturulur.' },"
    ),
    # ES
    (
        "para cualquier pregunta.' },",
        "para cualquier pregunta.', q7: '¿Hay una versión de prueba gratuita?', a7: 'Sí. Velnot te da <strong>3 grabaciones gratis</strong> sin tarjeta de crédito — descarga y empieza. Cuando terminen, elige un plan. La clave de licencia se envía al instante por email tras la compra.', q8: '¿Qué idiomas admite?', a8: 'Velnot usa <strong>OpenAI Whisper</strong> para la transcripción, que admite <strong>99 idiomas</strong> incluyendo español, inglés, turco, francés, alemán, árabe, hindi, japonés, coreano, chino, indonesio, portugués, ruso, bengalí y muchos más. El resumen de IA se genera en el mismo idioma que la transcripción.' },"
    ),
    # FR
    (
        "pour toute question.' },",
        "pour toute question.', q7: 'Y a-t-il un essai gratuit\u00a0?', a7: 'Oui. Velnot vous offre <strong>3 enregistrements gratuits</strong> sans carte bancaire — téléchargez et commencez. Quand les gratuits sont épuisés, choisissez un plan. La clé de licence est envoyée instantanément par email après l\\'achat.', q8: 'Quelles langues sont prises en charge\u00a0?', a8: 'Velnot utilise <strong>OpenAI Whisper</strong> pour la transcription, qui prend en charge <strong>99 langues</strong> dont le français, l\\'anglais, le turc, l\\'espagnol, l\\'allemand, l\\'arabe, le hindi, le japonais, le coréen, le chinois, l\\'indonésien, le portugais, le russe, le bengali et bien d\\'autres. Le résumé IA est généré dans la même langue que la transcription.' },"
    ),
    # DE
    (
        "bei Fragen.' },",
        "bei Fragen.', q7: 'Gibt es eine kostenlose Testversion?', a7: 'Ja. Velnot gibt Ihnen <strong>3 kostenlose Aufnahmen</strong> ohne Kreditkarte — einfach herunterladen und loslegen. Wenn sie aufgebraucht sind, wählen Sie einen Plan. Der Lizenzschlüssel wird nach dem Kauf sofort per E-Mail gesendet.', q8: 'Welche Sprachen werden unterstützt?', a8: 'Velnot verwendet <strong>OpenAI Whisper</strong> für die Transkription, das <strong>99 Sprachen</strong> unterstützt, darunter Deutsch, Englisch, Türkisch, Spanisch, Französisch, Arabisch, Hindi, Japanisch, Koreanisch, Chinesisch, Indonesisch, Portugiesisch, Russisch, Bengalisch und viele mehr. Die KI-Zusammenfassung wird in der gleichen Sprache wie das Transkript erstellt.' },"
    ),
    # PT
    (
        "para dúvidas.' },",
        "para dúvidas.', q7: 'Há uma versão de teste gratuita?', a7: 'Sim. O Velnot oferece <strong>3 gravações gratuitas</strong> sem cartão de crédito — baixe e comece. Quando acabarem, escolha um plano. A chave de licença é enviada instantaneamente por email após a compra.', q8: 'Quais idiomas são suportados?', a8: 'Velnot usa <strong>OpenAI Whisper</strong> para transcrição, que suporta <strong>99 idiomas</strong> incluindo português, inglês, turco, espanhol, francês, árabe, hindi, japonês, coreano, chinês, indonésio, russo, bengali e muitos outros. O resumo IA é gerado no mesmo idioma que a transcrição.' },"
    ),
    # AR
    (
        "لأي استفسار.' },",
        "لأي استفسار.', q7: 'هل هناك تجربة مجانية؟', a7: 'نعم. يمنحك Velnot <strong>3 تسجيلات مجانية</strong> دون الحاجة إلى بطاقة ائتمان — فقط قم بالتنزيل والبدء. بعد استخدامها اختر خطة للمتابعة. يُرسل مفتاح الترخيص فوراً عبر البريد الإلكتروني بعد الشراء.', q8: 'ما اللغات التي يدعمها؟', a8: 'يستخدم Velnot <strong>OpenAI Whisper</strong> للنسخ الذي يدعم <strong>99 لغة</strong> بما فيها العربية والإنجليزية والتركية والإسبانية والفرنسية والهندية واليابانية والكورية والصينية والإندونيسية والبرتغالية والروسية والبنغالية وغيرها. يتم إنشاء ملخص الذكاء الاصطناعي بنفس لغة النص.' },"
    ),
    # HI
    (
        "support@velnot.com</a> पर संपर्क करें।' },",
        "support@velnot.com</a> पर संपर्क करें।', q7: 'क्या कोई निःशुल्क परीक्षण है?', a7: 'हाँ। Velnot आपको बिना क्रेडिट कार्ड के <strong>3 मुफ़्त रिकॉर्डिंग</strong> देता है — बस डाउनलोड करें और शुरू करें। मुफ़्त रिकॉर्डिंग के बाद एक प्लान चुनें। खरीद के तुरंत बाद लाइसेंस key ईमेल पर आ जाती है।', q8: 'यह कौन सी भाषाओं का समर्थन करता है?', a8: 'Velnot ट्रांसक्रिप्शन के लिए <strong>OpenAI Whisper</strong> का उपयोग करता है जो हिंदी, अंग्रेजी, तुर्की, स्पेनिश, फ्रेंच, अरबी, जापानी, कोरियाई, चीनी, इंडोनेशियाई, पुर्तगाली, रूसी, बंगाली सहित <strong>99 भाषाओं</strong> का समर्थन करता है। AI सारांश उसी भाषा में बनाया जाता है।' },"
    ),
    # RU
    (
        "support@velnot.com</a>.' },",
        "support@velnot.com</a>.', q7: 'Есть ли бесплатный пробный период?', a7: 'Да. Velnot даёт вам <strong>3 бесплатных записи</strong> без кредитной карты — просто скачайте и начните. Когда они закончатся выберите план. Лицензионный ключ отправляется на email сразу после покупки.', q8: 'Какие языки поддерживаются?', a8: 'Velnot использует <strong>OpenAI Whisper</strong> для транскрипции который поддерживает <strong>99 языков</strong> включая русский английский турецкий испанский французский немецкий арабский хинди японский корейский китайский индонезийский португальский бенгальский и многие другие. Краткое содержание ИИ генерируется на том же языке.' },"
    ),
    # JA
    (
        "入力してください。' },",
        "入力してください。', q7: '無料トライアルはありますか？', a7: 'はい。Velnotはクレジットカード不要で<strong>3回分の無料録音</strong>を提供します。ダウンロードして始めてください。無料録音を使い切ったらプランを選んでください。購入後すぐにライセンスキーがメールで届きます。', q8: 'どの言語に対応していますか？', a8: 'Velnotは文字起こしに<strong>OpenAI Whisper</strong>を使用しており日本語英語トルコ語スペイン語フランス語ドイツ語アラビア語ヒンディー語韓国語中国語インドネシア語ポルトガル語ロシア語ベンガル語を含む<strong>99言語</strong>に対応しています。AIの要約は文字起こしと同じ言語で生成されます。' },"
    ),
    # ID
    (
        "kunci lisensi.' },",
        "kunci lisensi.', q7: 'Apakah ada uji coba gratis?', a7: 'Ya. Velnot memberi Anda <strong>3 rekaman gratis</strong> tanpa kartu kredit — cukup unduh dan mulai. Setelah habis pilih paket untuk melanjutkan. Kunci lisensi dikirim langsung ke email Anda setelah pembelian.', q8: 'Bahasa apa saja yang didukung?', a8: 'Velnot menggunakan <strong>OpenAI Whisper</strong> untuk transkripsi yang mendukung <strong>99 bahasa</strong> termasuk bahasa Indonesia Inggris Turki Spanyol Prancis Jerman Arab Hindi Jepang Korea Cina Portugis Rusia Bengali dan banyak lagi. Ringkasan AI dibuat dalam bahasa yang sama.' },"
    ),
    # KO
    (
        "라이선스 키를 입력하세요.' },",
        "라이선스 키를 입력하세요.', q7: '무료 체험이 있나요?', a7: '네. Velnot은 신용카드 없이 <strong>3번의 무료 녹음</strong>을 제공합니다. 다운로드하고 바로 시작하세요. 다 사용하면 플랜을 선택하세요. 구매 후 라이선스 키가 즉시 이메일로 전송됩니다.', q8: '어떤 언어를 지원하나요?', a8: 'Velnot은 전사를 위해 <strong>OpenAI Whisper</strong>를 사용하며 한국어 영어 터키어 스페인어 프랑스어 독일어 아랍어 힌디어 일본어 중국어 인도네시아어 포르투갈어 러시아어 벵골어를 포함한 <strong>99개 언어</strong>를 지원합니다. AI 요약은 전사와 같은 언어로 생성됩니다.' },"
    ),
    # BN
    (
        "অ্যাক্টিভেট করুন।' },",
        "অ্যাক্টিভেট করুন।', q7: 'কি বিনামূল্যে ট্রায়াল আছে?', a7: 'হ্যাঁ। Velnot ক্রেডিট কার্ড ছাড়াই <strong>৩টি বিনামূল্যে রেকর্ডিং</strong> দেয় — শুধু ডাউনলোড করুন এবং শুরু করুন। শেষ হলে একটি প্ল্যান বেছে নিন। কেনার পরে লাইসেন্স কী তাৎক্ষণিকভাবে ইমেইলে পাঠানো হয়।', q8: 'কোন ভাষাগুলি সমর্থন করে?', a8: 'Velnot ট্রান্সক্রিপশনের জন্য <strong>OpenAI Whisper</strong> ব্যবহার করে যা বাংলা ইংরেজি তুর্কি স্পেনীয় ফরাসি জার্মান আরবি হিন্দি জাপানি কোরিয়ান চীনা ইন্দোনেশিয়ান পর্তুগিজ রাশিয়ান সহ <strong>99টি ভাষা</strong> সমর্থন করে। AI সারসংক্ষেপ ট্রান্সক্রিপ্টের মতো একই ভাষায় তৈরি হয়।' },"
    ),
]

for old, new in faq_additions:
    count = content.count(old)
    if count == 0:
        print(f"WARNING faq: not found: {old[:60]}...")
    elif count > 1:
        print(f"WARNING faq: {count} matches for: {old[:60]}...")
    else:
        content = content.replace(old, new)
        print(f"OK: faq q7/a7/q8/a8 added for: {old[:60]}")

# ── 6. Fix duplicate account key in hi (remove first shorter one) ──
old_dup = "      account: { label: 'खाता', title: 'पहले से लाइसेंस है? साइन इन करें', sub: 'खरीदारी में उपयोग किया ईमेल दर्ज करें, हम लॉगिन लिंक भेजेंगे।', emailPlaceholder: 'खरीद में उपयोग किया ईमेल', sendLink: 'Magic Link भेजें', sending: 'भेज रहे हैं...', checkEmail: '📧 अपना ईमेल देखें। लिंक 15 मिनट के लिए वैध है।', notFound: 'इस ईमेल के लिए कोई लाइसेंस नहीं मिला।' },\n"
if old_dup in content:
    content = content.replace(old_dup, '', 1)
    print("OK: removed duplicate account key in hi")
else:
    print("INFO: hi duplicate account not found (may already be fixed or different format)")

print(f"\nOriginal size: {original_len}, New size: {len(content)}")
print(f"Difference: +{len(content) - original_len} chars")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("File written successfully.")
