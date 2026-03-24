'use strict';
const { PNG } = require('pngjs');
const { imagesToIco } = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

function makeGradientBitmap(size) {
  const cx = size / 2, cy = size / 2;
  const data = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) * 4;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;
      const t = Math.min(1, Math.sqrt(dx * dx + dy * dy));
      // Radial: #8b5cf6 (centre) → #6366f1 (edge)
      data[idx]   = Math.round(0x8b + (0x63 - 0x8b) * t); // R
      data[idx+1] = Math.round(0x5c + (0x66 - 0x5c) * t); // G
      data[idx+2] = Math.round(0xf6 + (0xf1 - 0xf6) * t); // B
      data[idx+3] = 255;                                    // A
    }
  }
  return { width: size, height: size, data };
}

// Save icon.png (256×256)
const bitmap256 = makeGradientBitmap(256);
const png = new PNG({ width: 256, height: 256 });
bitmap256.data.copy(png.data);
const pngBuf = PNG.sync.write(png);
fs.writeFileSync(path.join(OUT, 'icon.png'), pngBuf);
console.log('✅ assets/icon.png oluşturuldu');

// Save icon.ico (256, 48, 32, 16 — multi-size ICO)
const sizes = [256, 48, 32, 16];
const bitmaps = sizes.map(makeGradientBitmap);
const icoBuf = imagesToIco(bitmaps);
fs.writeFileSync(path.join(OUT, 'icon.ico'), icoBuf);
console.log('✅ assets/icon.ico oluşturuldu (' + sizes.join('px, ') + 'px)');
