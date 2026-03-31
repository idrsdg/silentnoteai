'use strict';
const { createCanvas } = require('canvas');
const { imagesToIco } = require('png-to-ico');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // ── Background: orange→pink gradient, rounded square ──────────────────────
  const r = size * 0.22;
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#f97316');
  grad.addColorStop(1, '#ec4899');

  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  const cx = size / 2;

  // ── V letterform ───────────────────────────────────────────────────────────
  // Two diagonal arms meeting at a sharp bottom point
  const vTopY    = size * 0.16;
  const vBottomY = size * 0.64;
  const vLeftX   = size * 0.14;
  const vRightX  = size * 0.86;
  const sw       = size * 0.095; // stroke thickness

  ctx.strokeStyle = 'rgba(255,255,255,0.96)';
  ctx.lineWidth   = sw;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  ctx.beginPath();
  ctx.moveTo(vLeftX, vTopY);
  ctx.lineTo(cx, vBottomY);
  ctx.lineTo(vRightX, vTopY);
  ctx.stroke();

  // ── Sound wave under the V (skip at tiny sizes) ────────────────────────────
  if (size >= 32) {
    const wY    = size * 0.80;
    const wL    = size * 0.22;
    const wR    = size * 0.78;
    const wW    = wR - wL;
    const amp   = size * 0.028;
    const steps = 60;

    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth   = size * 0.038;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = wL + t * wW;
      // 3-cycle sine wave; fade to zero at edges for clean ends
      const envelope = Math.sin(t * Math.PI);
      const y = wY - Math.sin(t * Math.PI * 6) * amp * envelope;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  return canvas;
}

function makeIconPng(size) {
  return drawIcon(size).toBuffer('image/png');
}

function makeIconBitmap(size) {
  const canvas = drawIcon(size);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, size, size);
  return { width: size, height: size, data: Buffer.from(imageData.data) };
}

// Save icon.png (256×256)
const png256 = makeIconPng(256);
fs.writeFileSync(path.join(OUT, 'icon.png'), png256);
console.log('✅ assets/icon.png oluşturuldu');

// Save icon.ico (256, 48, 32, 16)
const sizes = [256, 48, 32, 16];
const buffers = sizes.map(makeIconBitmap);

(async () => {
  const icoBuf = await imagesToIco(buffers);
  fs.writeFileSync(path.join(OUT, 'icon.ico'), icoBuf);
  console.log('✅ assets/icon.ico oluşturuldu (' + sizes.join('px, ') + 'px)');
})();
