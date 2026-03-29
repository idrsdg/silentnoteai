import { readFileSync, writeFileSync } from 'fs';

const path = String.raw`C:\Users\idris.dag\Desktop\Trivials\Apps\velnot\silent-note-landing\index.html`;
let content = readFileSync(path, 'utf8');
const originalLen = content.length;

// ── 1. data-i18n → data-i18n-html for pricing.freeTier (contains <strong>) ──
content = content.replaceAll(
  'data-i18n="pricing.freeTier"',
  'data-i18n-html="pricing.freeTier"'
);

// ── 2. Make price amounts dynamic in HTML ──
content = content.replace(
  '<div class="price-amount">$9.99<span data-i18n="plan.monthly.period">',
  '<div class="price-amount"><span data-i18n="plan.monthly.amount">$10.99</span><span data-i18n="plan.monthly.period">'
);
content = content.replace(
  '<div class="price-amount">$89.99<span data-i18n="plan.yearly.period">',
  '<div class="price-amount"><span data-i18n="plan.yearly.amount">$89.99</span><span data-i18n="plan.yearly.period">'
);
content = content.replace(
  '<div class="price-amount">$199.99<span style="font-size:16px;color:#888;" data-i18n="plan.lifetime.period">',
  '<div class="price-amount"><span data-i18n="plan.lifetime.amount">$219</span><span style="font-size:16px;color:#888;" data-i18n="plan.lifetime.period">'
);

// ── 3. Add plan amounts to T.en ──
content = content.replace(
  "monthly: { name: 'Monthly', period: '/mo', note: 'billed monthly · cancel anytime' }",
  "monthly: { name: 'Monthly', amount: '$10.99', period: '/mo', note: 'billed monthly · cancel anytime' }"
);
content = content.replace(
  "yearly: { badge: '⭐ Most Popular · 25% off', name: 'Yearly', period: '/yr', note: '$7.50/mo · billed annually' }",
  "yearly: { badge: '⭐ Most Popular · 25% off', name: 'Yearly', amount: '$89.99', period: '/yr', note: '$7.50/mo · billed annually' }"
);
content = content.replace(
  "lifetime: { badge: '♾ Best Value', name: 'Lifetime', period: ' one-time', note: 'pay once, use forever' }",
  "lifetime: { badge: '♾ Best Value', name: 'Lifetime', amount: '$219', period: ' one-time', note: 'pay once, use forever' }"
);

// ── 4. Update compare.pricing prices ($9.99 → $10.99) ──
const priceMap = [
  ["pricing: '✅ $9.99/ay\\'dan'", "pricing: '✅ $10.99/ay\\'dan'"],
  ["pricing: '✅ From $9.99/mo'", "pricing: '✅ From $10.99/mo'"],
  ["pricing: '✅ Desde $9.99/mes'", "pricing: '✅ Desde $10.99/mes'"],
  ["pricing: '✅ À partir de $9.99/mois'", "pricing: '✅ À partir de $10.99/mois'"],
  ["pricing: '✅ Ab $9.99/Monat'", "pricing: '✅ Ab $10.99/Monat'"],
  ["pricing: '✅ A partir de $9.99/mês'", "pricing: '✅ A partir de $10.99/mês'"],
  ["pricing: '✅ 从$9.99/月起'", "pricing: '✅ 从$10.99/月起'"],
  ["pricing: '✅ من $9.99/شهر'", "pricing: '✅ من $10.99/شهر'"],
  ["pricing: '✅ $9.99/माह से'", "pricing: '✅ $10.99/माह से'"],
  ["pricing: '✅ от $9.99/мес'", "pricing: '✅ от $10.99/мес'"],
  ["pricing: '✅ $9.99/月から'", "pricing: '✅ $10.99/月から'"],
  ["pricing: '✅ Dari $9.99/bln'", "pricing: '✅ Dari $10.99/bln'"],
  ["pricing: '✅ $9.99/월부터'", "pricing: '✅ $10.99/월부터'"],
  ["pricing: '✅ $9.99/মাস থেকে'", "pricing: '✅ $10.99/মাস থেকে'"],
];
for (const [old, nw] of priceMap) {
  const count = (content.match(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count === 0) console.log(`WARNING pricing not found: ${old.slice(0, 50)}`);
  else { content = content.replaceAll(old, nw); console.log(`OK: ${count}x pricing fixed: ${old.slice(0, 40)}`); }
}

// ── 5. FAQ q7/a7/q8/a8 additions ──
const faqAdditions = [
  // TR
  [
    "adresine iletebilirsin.' },",
    "adresine iletebilirsin.', q7: 'Ücretsiz deneme var mı?', a7: 'Evet. Velnot sana kredi kartı gerekmeden <strong>3 ücretsiz kayıt</strong> hakkı tanır — sadece indir ve başla. Ücretsiz hakkın bitince bir plan seç. Satın alma sonrası lisans key anında e-postayla gönderilir.', q8: 'Hangi dilleri destekliyor?', a8: 'Velnot transkripsiyon için <strong>OpenAI Whisper</strong> kullanır. Türkçe, İngilizce, İspanyolca, Fransızca, Almanca, Arapça, Hintçe, Japonca, Korece, Çince, Endonezce, Portekizce, Rusça, Bengalce dahil <strong>99 dil</strong> desteklenir. AI özeti transkriptle aynı dilde oluşturulur.' },"
  ],
  // ES
  [
    "para cualquier pregunta.' },",
    "para cualquier pregunta.', q7: '¿Hay una versión de prueba gratuita?', a7: 'Sí. Velnot te da <strong>3 grabaciones gratis</strong> sin tarjeta de crédito — descarga y empieza. Cuando terminen elige un plan. La clave de licencia se envía al instante por email tras la compra.', q8: '¿Qué idiomas admite?', a8: 'Velnot usa <strong>OpenAI Whisper</strong> para la transcripción que admite <strong>99 idiomas</strong> incluyendo español, inglés, turco, francés, alemán, árabe, hindi, japonés, coreano, chino, indonesio, portugués, ruso, bengalí y muchos más. El resumen de IA se genera en el mismo idioma.' },"
  ],
  // FR
  [
    "pour toute question.' },",
    "pour toute question.', q7: 'Y a-t-il un essai gratuit ?', a7: 'Oui. Velnot vous offre <strong>3 enregistrements gratuits</strong> sans carte bancaire — téléchargez et commencez. Quand les gratuits sont épuisés choisissez un plan. La clé de licence est envoyée instantanément par email après l\\'achat.', q8: 'Quelles langues sont prises en charge ?', a8: 'Velnot utilise <strong>OpenAI Whisper</strong> pour la transcription qui prend en charge <strong>99 langues</strong> dont le français, l\\'anglais, le turc, l\\'espagnol, l\\'allemand, l\\'arabe, le hindi, le japonais, le coréen, le chinois, l\\'indonésien, le portugais, le russe, le bengali et bien d\\'autres. Le résumé IA est généré dans la même langue.' },"
  ],
  // DE
  [
    "bei Fragen.' },",
    "bei Fragen.', q7: 'Gibt es eine kostenlose Testversion?', a7: 'Ja. Velnot gibt Ihnen <strong>3 kostenlose Aufnahmen</strong> ohne Kreditkarte — einfach herunterladen und loslegen. Wenn sie aufgebraucht sind wählen Sie einen Plan. Der Lizenzschlüssel wird nach dem Kauf sofort per E-Mail gesendet.', q8: 'Welche Sprachen werden unterstützt?', a8: 'Velnot verwendet <strong>OpenAI Whisper</strong> für die Transkription das <strong>99 Sprachen</strong> unterstützt darunter Deutsch, Englisch, Türkisch, Spanisch, Französisch, Arabisch, Hindi, Japanisch, Koreanisch, Chinesisch, Indonesisch, Portugiesisch, Russisch, Bengalisch und viele mehr.' },"
  ],
  // PT
  [
    "para dúvidas.' },",
    "para dúvidas.', q7: 'Há uma versão de teste gratuita?', a7: 'Sim. O Velnot oferece <strong>3 gravações gratuitas</strong> sem cartão de crédito — baixe e comece. Quando acabarem escolha um plano. A chave de licença é enviada instantaneamente por email após a compra.', q8: 'Quais idiomas são suportados?', a8: 'Velnot usa <strong>OpenAI Whisper</strong> para transcrição que suporta <strong>99 idiomas</strong> incluindo português, inglês, turco, espanhol, francês, árabe, hindi, japonês, coreano, chinês, indonésio, russo, bengali e muitos outros. O resumo IA é gerado no mesmo idioma.' },"
  ],
  // AR
  [
    "\u0644\u0623\u064a \u0627\u0633\u062a\u0641\u0633\u0627\u0631.' },",
    "\u0644\u0623\u064a \u0627\u0633\u062a\u0641\u0633\u0627\u0631.', q7: '\u0647\u0644 \u0647\u0646\u0627\u0643 \u062a\u062c\u0631\u0628\u0629 \u0645\u062c\u0627\u0646\u064a\u0629\u061f', a7: '\u0646\u0639\u0645. \u064a\u0645\u0646\u062d\u0643 Velnot <strong>3 \u062a\u0633\u062c\u064a\u0644\u0627\u062a \u0645\u062c\u0627\u0646\u064a\u0629</strong> \u062f\u0648\u0646 \u0628\u0637\u0627\u0642\u0629 \u0627\u0626\u062a\u0645\u0627\u0646 \u2014 \u0641\u0642\u0637 \u0646\u0632\u0651\u0644 \u0648\u0627\u0628\u062f\u0623. \u0628\u0639\u062f \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u0627 \u0627\u062e\u062a\u0631 \u062e\u0637\u0629 \u0644\u0644\u0645\u062a\u0627\u0628\u0639\u0629. \u064a\u064f\u0631\u0633\u0644 \u0645\u0641\u062a\u0627\u062d \u0627\u0644\u062a\u0631\u062e\u064a\u0635 \u0641\u0648\u0631\u0627\u064b \u0628\u0639\u062f \u0627\u0644\u0634\u0631\u0627\u0621.', q8: '\u0645\u0627 \u0627\u0644\u0644\u063a\u0627\u062a \u0627\u0644\u062a\u064a \u064a\u062f\u0639\u0645\u0647\u0627\u061f', a8: '\u064a\u0633\u062a\u062e\u062f\u0645 Velnot <strong>OpenAI Whisper</strong> \u0644\u0644\u0646\u0633\u062e \u0627\u0644\u0630\u064a \u064a\u062f\u0639\u0645 <strong>99 \u0644\u063a\u0629</strong> \u0628\u0645\u0627 \u0641\u064a\u0647\u0627 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0648\u0627\u0644\u0625\u0646\u062c\u0644\u064a\u0632\u064a\u0629 \u0648\u0627\u0644\u062a\u0631\u0643\u064a\u0629 \u0648\u0627\u0644\u0625\u0633\u0628\u0627\u0646\u064a\u0629 \u0648\u0627\u0644\u0641\u0631\u0646\u0633\u064a\u0629 \u0648\u0627\u0644\u0647\u0646\u062f\u064a\u0629 \u0648\u0627\u0644\u064a\u0627\u0628\u0627\u0646\u064a\u0629 \u0648\u0627\u0644\u0643\u0648\u0631\u064a\u0629 \u0648\u0627\u0644\u0635\u064a\u0646\u064a\u0629 \u0648\u0627\u0644\u0625\u0646\u062f\u0648\u0646\u064a\u0633\u064a\u0629 \u0648\u0627\u0644\u0628\u0631\u062a\u063a\u0627\u0644\u064a\u0629 \u0648\u0627\u0644\u0631\u0648\u0633\u064a\u0629 \u0648\u0627\u0644\u0628\u0646\u063a\u0627\u0644\u064a\u0629. \u064a\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0644\u062e\u0635 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0628\u0646\u0641\u0633 \u0644\u063a\u0629 \u0627\u0644\u0646\u0635.' },"
  ],
  // HI
  [
    "support@velnot.com</a> \u092a\u0930 \u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0902\u0964' },",
    "support@velnot.com</a> \u092a\u0930 \u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0902\u0964', q7: '\u0915\u094d\u092f\u093e \u0915\u094b\u0908 \u0928\u093f\u0903\u0936\u0941\u0932\u094d\u0915 \u092a\u0930\u0940\u0915\u094d\u0937\u0923 \u0939\u0948?', a7: '\u0939\u093e\u0901\u0964 Velnot \u0906\u092a\u0915\u094b \u092c\u093f\u0928\u093e \u0915\u094d\u0930\u0947\u0921\u093f\u091f \u0915\u093e\u0930\u094d\u0921 \u0915\u0947 <strong>3 \u092e\u0941\u092b\u093c\u0924 \u0930\u093f\u0915\u0949\u0930\u094d\u0921\u093f\u0902\u0917</strong> \u0926\u0947\u0924\u093e \u0939\u0948 \u2014 \u092c\u0938 \u0921\u093e\u0909\u0928\u0932\u094b\u0921 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902\u0964 \u092e\u0941\u092b\u093c\u0924 \u0930\u093f\u0915\u0949\u0930\u094d\u0921\u093f\u0902\u0917 \u0915\u0947 \u092c\u093e\u0926 \u090f\u0915 \u092a\u094d\u0932\u093e\u0928 \u091a\u0941\u0928\u0947\u0902\u0964 \u0916\u0930\u0940\u0926 \u0915\u0947 \u0924\u0941\u0930\u0902\u0924 \u092c\u093e\u0926 \u0932\u093e\u0907\u0938\u0947\u0902\u0938 key \u0908\u092e\u0947\u0932 \u092a\u0930 \u0906 \u091c\u093e\u0924\u0940 \u0939\u0948\u0964', q8: '\u092f\u0939 \u0915\u094c\u0928 \u0938\u0940 \u092d\u093e\u0937\u093e\u0913\u0902 \u0915\u093e \u0938\u092e\u0930\u094d\u0925\u0928 \u0915\u0930\u0924\u093e \u0939\u0948?', a8: 'Velnot \u091f\u094d\u0930\u093e\u0902\u0938\u0915\u094d\u0930\u093f\u092a\u094d\u0936\u0928 \u0915\u0947 \u0932\u093f\u090f <strong>OpenAI Whisper</strong> \u0915\u093e \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0924\u093e \u0939\u0948 \u091c\u094b \u0939\u093f\u0902\u0926\u0940, \u0905\u0902\u0917\u094d\u0930\u0947\u091c\u093c\u0940, \u0924\u0941\u0930\u094d\u0915\u0940, \u0938\u094d\u092a\u0947\u0928\u093f\u0936, \u092b\u094d\u0930\u0947\u0902\u091a, \u0905\u0930\u092c\u0940, \u091c\u093e\u092a\u093e\u0928\u0940, \u0915\u094b\u0930\u093f\u092f\u093e\u0908, \u091a\u0940\u0928\u0940, \u0907\u0902\u0921\u094b\u0928\u0947\u0936\u093f\u092f\u093e\u0908, \u092a\u0941\u0930\u094d\u0924\u0917\u093e\u0932\u0940, \u0930\u0942\u0938\u0940, \u092c\u0902\u0917\u093e\u0932\u0940 \u0938\u0939\u093f\u0924 <strong>99 \u092d\u093e\u0937\u093e\u0913\u0902</strong> \u0915\u093e \u0938\u092e\u0930\u094d\u0925\u0928 \u0915\u0930\u0924\u093e \u0939\u0948\u0964 AI \u0938\u093e\u0930\u093e\u0902\u0936 \u0909\u0938\u0940 \u092d\u093e\u0937\u093e \u092e\u0947\u0902 \u092c\u0928\u0924\u093e \u0939\u0948\u0964' },"
  ],
  // RU
  [
    "support@velnot.com</a>.' },",
    "support@velnot.com</a>.', q7: '\u0415\u0441\u0442\u044c \u043b\u0438 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u043f\u0440\u043e\u0431\u043d\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434?', a7: '\u0414\u0430. Velnot \u0434\u0430\u0451\u0442 \u0432\u0430\u043c <strong>3 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0445 \u0437\u0430\u043f\u0438\u0441\u0438</strong> \u0431\u0435\u0437 \u043a\u0440\u0435\u0434\u0438\u0442\u043d\u043e\u0439 \u043a\u0430\u0440\u0442\u044b \u2014 \u043f\u0440\u043e\u0441\u0442\u043e \u0441\u043a\u0430\u0447\u0430\u0439\u0442\u0435 \u0438 \u043d\u0430\u0447\u043d\u0438\u0442\u0435. \u041a\u043e\u0433\u0434\u0430 \u043e\u043d\u0438 \u0437\u0430\u043a\u043e\u043d\u0447\u0430\u0442\u0441\u044f \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043b\u0430\u043d. \u041b\u0438\u0446\u0435\u043d\u0437\u0438\u043e\u043d\u043d\u044b\u0439 \u043a\u043b\u044e\u0447 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043d\u0430 email \u0441\u0440\u0430\u0437\u0443 \u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u043a\u0443\u043f\u043a\u0438.', q8: '\u041a\u0430\u043a\u0438\u0435 \u044f\u0437\u044b\u043a\u0438 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044e\u0442\u0441\u044f?', a8: 'Velnot \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 <strong>OpenAI Whisper</strong> \u0434\u043b\u044f \u0442\u0440\u0430\u043d\u0441\u043a\u0440\u0438\u043f\u0446\u0438\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 <strong>99 \u044f\u0437\u044b\u043a\u043e\u0432</strong>, \u0432\u043a\u043b\u044e\u0447\u0430\u044f \u0440\u0443\u0441\u0441\u043a\u0438\u0439, \u0430\u043d\u0433\u043b\u0438\u0439\u0441\u043a\u0438\u0439, \u0442\u0443\u0440\u0435\u0446\u043a\u0438\u0439, \u0438\u0441\u043f\u0430\u043d\u0441\u043a\u0438\u0439, \u0444\u0440\u0430\u043d\u0446\u0443\u0437\u0441\u043a\u0438\u0439, \u0430\u0440\u0430\u0431\u0441\u043a\u0438\u0439, \u0445\u0438\u043d\u0434\u0438, \u044f\u043f\u043e\u043d\u0441\u043a\u0438\u0439, \u043a\u043e\u0440\u0435\u0439\u0441\u043a\u0438\u0439, \u043a\u0438\u0442\u0430\u0439\u0441\u043a\u0438\u0439, \u0438\u043d\u0434\u043e\u043d\u0435\u0437\u0438\u0439\u0441\u043a\u0438\u0439, \u043f\u043e\u0440\u0442\u0443\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439, \u0431\u0435\u043d\u0433\u0430\u043b\u044c\u0441\u043a\u0438\u0439 \u0438 \u043c\u043d\u043e\u0433\u0438\u0435 \u0434\u0440\u0443\u0433\u0438\u0435. \u0420езюме ИИ генерируется на том же языке.' },"
  ],
  // JA
  [
    "\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002' },",
    "\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002', q7: '\u7121\u6599\u30c8\u30e9\u30a4\u30a2\u30eb\u306f\u3042\u308a\u307e\u3059\u304b\uff1f', a7: '\u306f\u3044\u3002Velnot\u306f\u30af\u30ec\u30b8\u30c3\u30c8\u30ab\u30fc\u30c9\u4e0d\u8981\u3067<strong>3\u56de\u5206\u306e\u7121\u6599\u9332\u97f3</strong>\u3092\u63d0\u4f9b\u3057\u307e\u3059\u3002\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3057\u3066\u59cb\u3081\u3066\u304f\u3060\u3055\u3044\u3002\u4f7f\u3044\u5207\u3063\u305f\u3089\u30d7\u30e9\u30f3\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002\u8cfc\u5165\u5f8c\u3059\u3050\u306b\u30e9\u30a4\u30bb\u30f3\u30b9\u30ad\u30fc\u304c\u30e1\u30fc\u30eb\u3067\u5c4a\u304d\u307e\u3059\u3002', q8: '\u3069\u306e\u8a00\u8a9e\u306b\u5bfe\u5fdc\u3057\u3066\u3044\u307e\u3059\u304b\uff1f', a8: 'Velnot\u306f\u6587\u5b57\u8d77\u3053\u3057\u306b<strong>OpenAI Whisper</strong>\u3092\u4f7f\u7528\u3057\u3066\u304a\u308a\u3001\u65e5\u672c\u8a9e\u3001\u82f1\u8a9e\u3001\u30c8\u30eb\u30b3\u8a9e\u3001\u30b9\u30da\u30a4\u30f3\u8a9e\u3001\u30d5\u30e9\u30f3\u30b9\u8a9e\u3001\u30a2\u30e9\u30d3\u30a2\u8a9e\u3001\u30d2\u30f3\u30c7\u30a3\u30fc\u8a9e\u3001\u97d3\u56fd\u8a9e\u3001\u4e2d\u56fd\u8a9e\u3001\u30a4\u30f3\u30c9\u30cd\u30b7\u30a2\u8a9e\u3001\u30dd\u30eb\u30c8\u30ac\u30eb\u8a9e\u3001\u30ed\u30b7\u30a2\u8a9e\u3001\u30d9\u30f3\u30ac\u30eb\u8a9e\u3092\u542b\u3080<strong>99\u8a00\u8a9e</strong>\u306b\u5bfe\u5fdc\u3057\u3066\u3044\u307e\u3059\u3002AI\u306e\u8981\u7d04\u306f\u6587\u5b57\u8d77\u3053\u3057\u3068\u540c\u3058\u8a00\u8a9e\u3067\u751f\u6210\u3055\u308c\u307e\u3059\u3002' },"
  ],
  // ID
  [
    "kunci lisensi.' },",
    "kunci lisensi.', q7: 'Apakah ada uji coba gratis?', a7: 'Ya. Velnot memberi Anda <strong>3 rekaman gratis</strong> tanpa kartu kredit \u2014 cukup unduh dan mulai. Setelah habis pilih paket untuk melanjutkan. Kunci lisensi dikirim langsung ke email Anda setelah pembelian.', q8: 'Bahasa apa saja yang didukung?', a8: 'Velnot menggunakan <strong>OpenAI Whisper</strong> untuk transkripsi yang mendukung <strong>99 bahasa</strong> termasuk bahasa Indonesia, Inggris, Turki, Spanyol, Prancis, Jerman, Arab, Hindi, Jepang, Korea, Cina, Portugis, Rusia, Bengali dan banyak lagi. Ringkasan AI dibuat dalam bahasa yang sama.' },"
  ],
  // KO
  [
    "\ub77c\uc774\uc120\uc2a4 \ud0a4\ub97c \uc785\ub825\ud558\uc138\uc694.' },",
    "\ub77c\uc774\uc120\uc2a4 \ud0a4\ub97c \uc785\ub825\ud558\uc138\uc694.', q7: '\ubb34\ub8cc \uccb4\ud5d8\uc774 \uc788\ub098\uc694?', a7: '\ub124. Velnot\uc740 \uc2e0\uc6a9\uce74\ub4dc \uc5c6\uc774 <strong>3\ubc88\uc758 \ubb34\ub8cc \ub179\uc74c</strong>\uc744 \uc81c\uacf5\ud569\ub2c8\ub2e4. \ub2e4\uc6b4\ub85c\ub4dc\ud558\uace0 \ubc14\ub85c \uc2dc\uc791\ud558\uc138\uc694. \ub2e4 \uc0ac\uc6a9\ud558\uba74 \ud50c\ub798\uc744 \uc120\ud0dd\ud558\uc138\uc694. \uad6c\ub9e4 \ud6c4 \ub77c\uc774\uc120\uc2a4 \ud0a4\uac00 \uc989\uc2dc \uc774\uba54\uc77c\ub85c \uc804\uc1a1\ub429\ub2c8\ub2e4.', q8: '\uc5b4\ub5a4 \uc5b8\uc5b4\ub97c \uc9c0\uc6d0\ud558\ub098\uc694?', a8: 'Velnot\uc740 \uc804\uc0ac\ub97c \uc704\ud574 <strong>OpenAI Whisper</strong>\ub97c \uc0ac\uc6a9\ud558\uba70 \ud55c\uad6d\uc5b4, \uc601\uc5b4, \ud130\ud0a4\uc5b4, \uc2a4\ud398\uc778\uc5b4, \ud504\ub791\uc2a4\uc5b4, \ub3c5\uc77c\uc5b4, \uc544\ub78d\uc5b4, \ud78c\ub514\uc5b4, \uc77c\ubcf8\uc5b4, \uc911\uad6d\uc5b4, \uc778\ub3c4\ub124\uc2dc\uc544\uc5b4, \ud3ec\ub974\ud22c\uac08\uc5b4, \ub7ec\uc2dc\uc544\uc5b4, \ubcb5\uace8\uc5b4\ub97c \ud3ec\ud568\ud55c <strong>99\uac1c \uc5b8\uc5b4</strong>\ub97c \uc9c0\uc6d0\ud569\ub2c8\ub2e4. AI \uc694\uc57d\uc740 \uc804\uc0ac\uc640 \uac19\uc740 \uc5b8\uc5b4\ub85c \uc0dd\uc131\ub429\ub2c8\ub2e4.' },"
  ],
  // BN
  [
    "\u0985\u09cd\u09af\u09be\u0995\u09cd\u099f\u09bf\u09ad\u09c7\u099f \u0995\u09b0\u09c1\u09a8\u0964' },",
    "\u0985\u09cd\u09af\u09be\u0995\u09cd\u099f\u09bf\u09ad\u09c7\u099f \u0995\u09b0\u09c1\u09a8\u0964', q7: '\u0995\u09bf \u09ac\u09bf\u09a8\u09be\u09ae\u09c2\u09b2\u09cd\u09af\u09c7 \u099f\u09cd\u09b0\u09be\u09af\u09bc\u09be\u09b2 \u0986\u099b\u09c7?', a7: '\u09b9\u09cd\u09af\u09be\u0981\u0964 Velnot \u0995\u09cd\u09b0\u09c7\u09a1\u09bf\u099f \u0995\u09be\u09b0\u09cd\u09a1 \u099b\u09be\u09dc\u09be\u0987 <strong>\u09e9\u099f\u09bf \u09ac\u09bf\u09a8\u09be\u09ae\u09c2\u09b2\u09cd\u09af\u09c7 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1\u09bf\u0982</strong> \u09a6\u09c7\u09af\u09bc \u2014 \u09b6\u09c1\u09a7\u09c1 \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8 \u098f\u09ac\u0982 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8\u0964 \u09b6\u09c7\u09b7 \u09b9\u09b2\u09c7 \u098f\u0995\u099f\u09bf \u09aa\u09cd\u09b2\u09cd\u09af\u09be\u09a8 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09a8\u0964 \u0995\u09c7\u09a8\u09be\u09b0 \u09aa\u09b0\u09c7 \u09b2\u09be\u0987\u09b8\u09c7\u09a8\u09cd\u09b8 \u0995\u09c0 \u09a4\u09be\u09ce\u0995\u09cd\u09b7\u09a3\u09bf\u0995\u09ad\u09be\u09ac\u09c7 \u0987\u09ae\u09c7\u0987\u09b2\u09c7 \u09aa\u09be\u09a0\u09be\u09a8\u09cb \u09b9\u09af\u09bc\u0964', q8: '\u0995\u09cb\u09a8 \u09ad\u09be\u09b7\u09be\u0997\u09c1\u09b2\u09bf \u09b8\u09ae\u09b0\u09cd\u09a5\u09a8 \u0995\u09b0\u09c7?', a8: 'Velnot \u099f\u09cd\u09b0\u09be\u09a8\u09cd\u09b8\u0995\u09cd\u09b0\u09bf\u09aa\u09b6\u09a8\u09c7\u09b0 \u099c\u09a8\u09cd\u09af <strong>OpenAI Whisper</strong> \u09ac\u09cd\u09af\u09ac\u09b9\u09be\u09b0 \u0995\u09b0\u09c7 \u09af\u09be \u09ac\u09be\u0982\u09b2\u09be, \u0987\u0982\u09b0\u09c7\u099c\u09bf, \u09a4\u09c1\u09b0\u09cd\u0995\u09bf, \u09b8\u09cd\u09aa\u09c7\u09a8\u09c0\u09af\u09bc, \u09ab\u09b0\u09be\u09b8\u09bf, \u099c\u09be\u09b0\u09cd\u09ae\u09be\u09a8, \u0986\u09b0\u09ac\u09bf, \u09b9\u09bf\u09a8\u09cd\u09a6\u09bf, \u099c\u09be\u09aa\u09be\u09a8\u09bf, \u0995\u09cb\u09b0\u09bf\u09af\u09bc\u09be\u09a8, \u099a\u09c0\u09a8\u09be, \u0987\u09a8\u09cd\u09a6\u09cb\u09a8\u09c7\u09b6\u09bf\u09af\u09bc\u09be\u09a8, \u09aa\u09b0\u09cd\u09a4\u09c1\u0997\u09bf\u099c, \u09b0\u09be\u09b6\u09bf\u09af\u09bc\u09be\u09a8 \u09b8\u09b9 <strong>99\u099f\u09bf \u09ad\u09be\u09b7\u09be</strong> \u09b8\u09ae\u09b0\u09cd\u09a5\u09a8 \u0995\u09b0\u09c7\u0964 AI \u09b8\u09be\u09b0\u09b8\u0982\u0995\u09cd\u09b7\u09c7\u09aa \u09ac\u09be\u0982\u09b2\u09be\u09af\u09bc \u09a4\u09c8\u09b0\u09bf \u09b9\u09af\u09bc\u0964' },"
  ],
];

for (const [old, nw] of faqAdditions) {
  const count = (content.split(old).length - 1);
  if (count === 0) console.log(`WARNING faq not found: ${old.slice(0, 50)}...`);
  else if (count > 1) console.log(`WARNING faq ${count} matches: ${old.slice(0, 50)}...`);
  else { content = content.replace(old, nw); console.log(`OK: faq q7/a7/q8/a8 → ${old.slice(0, 50)}`); }
}

// ── 6. Fix duplicate account key in hi ──
const dupKey = `      account: { label: 'खाता', title: 'पहले से लाइसेंस है? साइन इन करें', sub: 'खरीदारी में उपयोग किया ईमेल दर्ज करें, हम लॉगिन लिंक भेजेंगे।', emailPlaceholder: 'खरीद में उपयोग किया ईमेल', sendLink: 'Magic Link भेजें', sending: 'भेज रहे हैं...', checkEmail: '📧 अपना ईमेल देखें। लिंक 15 मिनट के लिए वैध है।', notFound: 'इस ईमेल के लिए कोई लाइसेंस नहीं मिला।' },\n`;
if (content.includes(dupKey)) {
  content = content.replace(dupKey, '');
  console.log('OK: removed duplicate account key in hi');
} else {
  console.log('INFO: hi duplicate account not found');
}

console.log(`\nOriginal: ${originalLen} chars, New: ${content.length} chars, Diff: +${content.length - originalLen}`);
writeFileSync(path, content, 'utf8');
console.log('File written successfully.');
