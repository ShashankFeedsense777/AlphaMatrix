import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 630;

const svgOverlay = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="50%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="topBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="40%" stop-color="rgba(249,115,22,0)"/>
    </linearGradient>
    <linearGradient id="bottomBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="60%" stop-color="rgba(249,115,22,0)"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Grid lines -->
  <g stroke="rgba(249,115,22,0.06)" stroke-width="1">
    ${Array.from({length: 31}, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="${HEIGHT}"/>`).join('')}
    ${Array.from({length: 16}, (_, i) => `<line x1="0" y1="${i * 42}" x2="${WIDTH}" y2="${i * 42}"/>`).join('')}
  </g>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${WIDTH}" height="5" fill="url(#topBar)"/>

  <!-- Bottom accent bar -->
  <rect x="0" y="${HEIGHT - 5}" width="${WIDTH}" height="5" fill="url(#bottomBar)"/>

  <!-- Logo mark (A in open box) — matches favicon.svg exactly -->
  <g transform="translate(70, 185) scale(0.85)" stroke="#ffffff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 22,64 L 22,22 L 106,22 L 106,106 L 64,106"/>
    <path d="M 44,83 L 64,41 L 84,83"/>
    <path d="M 51,68 L 77,68"/>
  </g>

  <!-- Title -->
  <text x="220" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="58" font-weight="700" fill="#ffffff">AlphaMatrix</text>

  <!-- Tagline line 1 -->
  <text x="220" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="400" fill="#9ca3af">Quantitative Trading &amp;</text>

  <!-- Tagline line 2 (accented) -->
  <text x="220" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="600" fill="#f97316">AI-Driven Market Intelligence</text>

  <!-- URL -->
  <text x="${WIDTH - 40}" y="${HEIGHT - 30}" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="rgba(255,255,255,0.3)" text-anchor="end">alphamatrixsecurities.com</text>
</svg>
`;

const outPath = path.join(__dirname, '..', 'public', 'og-image.png');

await sharp(Buffer.from(svgOverlay))
  .resize(WIDTH, HEIGHT)
  .png()
  .toFile(outPath);

console.log(`OG image saved to ${outPath} (${WIDTH}x${HEIGHT})`);
