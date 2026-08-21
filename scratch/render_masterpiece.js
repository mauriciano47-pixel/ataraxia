const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = 'C:\\Users\\mauro\\.gemini\\antigravity\\brain\\621a4605-5ae2-493b-a00e-d175f7834788';
const projectAssetDir = 'c:\\Users\\mauro\\OneDrive\\Documentos\\ATARAXIA_APP\\ataraxia\\assets\\images';
const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const masterpieceSvg = `
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Fondo Cósmico Ónix y Sol Invictus -->
    <radialGradient id="deepSpaceGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFE259" stop-opacity="0.35"/>
      <stop offset="25%" stop-color="#D4AF37" stop-opacity="0.2"/>
      <stop offset="60%" stop-color="#F59E0B" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="coreAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="20%" stop-color="#FFE259" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Gradientes de Oro Imperial 24k Biselado -->
    <linearGradient id="goldLightFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="20%" stop-color="#FFFBEB"/>
      <stop offset="45%" stop-color="#FDE047"/>
      <stop offset="70%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <linearGradient id="goldDarkFacet" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706"/>
      <stop offset="40%" stop-color="#B45309"/>
      <stop offset="75%" stop-color="#78350F"/>
      <stop offset="100%" stop-color="#451A03"/>
    </linearGradient>

    <linearGradient id="laurelLeafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFDE0"/>
      <stop offset="30%" stop-color="#FDE047"/>
      <stop offset="70%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>

    <linearGradient id="purePlasma" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="50%" stop-color="#FFFDE0" stop-opacity="1"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1"/>
    </linearGradient>

    <filter id="divineGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Fondo Negro OLED Puro -->
  <rect width="800" height="800" fill="#000000"/>

  <!-- Halo Cósmico Solar -->
  <circle cx="400" cy="400" r="360" fill="url(#deepSpaceGlow)"/>

  <!-- Rayos Solares Geométricos Sagrados de Fondo (Sol Invictus) -->
  <g stroke="rgba(255, 226, 89, 0.15)" stroke-width="1.5">
    <line x1="400" y1="80" x2="400" y2="720"/>
    <line x1="80" y1="400" x2="720" y2="400"/>
    <line x1="174" y1="174" x2="626" y2="626"/>
    <line x1="174" y1="626" x2="626" y2="174"/>
    <line x1="260" y1="100" x2="540" y2="700"/>
    <line x1="540" y1="100" x2="260" y2="700"/>
    <line x1="100" y1="260" x2="700" y2="540"/>
    <line x1="100" y1="540" x2="700" y2="260"/>
  </g>

  <!-- Anillos Concéntricos Celestiales con Puntos Cardinales -->
  <circle cx="400" cy="400" r="320" stroke="rgba(255, 226, 89, 0.4)" stroke-width="2" stroke-dasharray="8,10" fill="none"/>
  <circle cx="400" cy="400" r="300" stroke="rgba(212, 175, 55, 0.6)" stroke-width="3" fill="none"/>
  <circle cx="400" cy="400" r="285" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1" stroke-dasharray="4,6" fill="none"/>

  <!-- Corona Triunfal de Laureles Esculpidos (Corona Triumphalis Imperial) -->
  <g fill="url(#laurelLeafGrad)" stroke="#FFE259" stroke-width="1.5" filter="drop-shadow(0 0 10px rgba(245,158,11,0.5))">
    <!-- Rama Izquierda -->
    <path d="M 230 180 C 180 160, 150 200, 190 230 C 220 230, 240 210, 230 180 Z"/>
    <path d="M 180 250 C 130 240, 110 280, 150 310 C 180 310, 200 280, 180 250 Z"/>
    <path d="M 160 340 C 110 340, 100 380, 140 410 C 170 410, 190 380, 160 340 Z"/>
    <path d="M 180 440 C 140 450, 130 490, 170 520 C 200 510, 210 470, 180 440 Z"/>
    <path d="M 230 530 C 200 560, 210 600, 250 610 C 280 590, 270 550, 230 530 Z"/>
    <path d="M 310 600 C 290 630, 320 660, 360 650 C 370 620, 350 590, 310 600 Z"/>

    <!-- Rama Derecha -->
    <path d="M 570 180 C 620 160, 650 200, 610 230 C 580 230, 560 210, 570 180 Z"/>
    <path d="M 620 250 C 670 240, 690 280, 650 310 C 620 310, 600 280, 620 250 Z"/>
    <path d="M 640 340 C 690 340, 700 380, 660 410 C 630 410, 610 380, 640 340 Z"/>
    <path d="M 620 440 C 660 450, 670 490, 630 520 C 600 510, 590 470, 620 440 Z"/>
    <path d="M 570 530 C 600 560, 590 600, 550 610 C 520 590, 530 550, 570 530 Z"/>
    <path d="M 490 600 C 510 630, 480 660, 440 650 C 430 620, 450 590, 490 600 Z"/>
  </g>

  <!-- EL GRAN RAYO DE ZEUS MONUMENTAL 3D -->
  <!-- Sombra 3D Profunda -->
  <polygon points="460,80 230,390 350,390 260,680 560,330 410,330" fill="#2A0800" transform="translate(10, 14)" opacity="0.9"/>
  
  <!-- Resplandor Neón de Alta Potencia -->
  <polygon points="460,80 230,390 350,390 260,680 560,330 410,330" stroke="#FFE259" stroke-width="22" fill="none" filter="url(#divineGlow)" opacity="0.8"/>
  <polygon points="460,80 230,390 350,390 260,680 560,330 410,330" stroke="#F59E0B" stroke-width="12" fill="none" opacity="0.9"/>

  <!-- Faceta Derecha en Sombra de Bronce y Oro Profundo 3D -->
  <polygon points="460,80 410,390 260,680 560,330 410,330" fill="url(#goldDarkFacet)" stroke="#78350F" stroke-width="2"/>

  <!-- Faceta Izquierda en Luz de Oro Diamante Incandescente 3D -->
  <polygon points="460,80 230,390 350,390 260,680 410,390" fill="url(#goldLightFacet)" stroke="#FFFDE0" stroke-width="2.5"/>

  <!-- Columna Vertebral de Plasma Puro y Quiebre de Energía -->
  <path d="M 460 80 L 410 390 L 260 680" stroke="url(#purePlasma)" stroke-width="8" stroke-linecap="round" fill="none" filter="drop-shadow(0 0 8px #FFFFFF)"/>
  <path d="M 460 80 L 410 390 L 260 680" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" fill="none"/>

  <!-- Estallido Estelar Nova de 8 Puntas en la Cúspide y en la Punta de Impacto -->
  <g transform="translate(460, 80)">
    <circle cx="0" cy="0" r="16" fill="#FFFFFF" filter="url(#divineGlow)"/>
    <circle cx="0" cy="0" r="8" fill="#FFFDE0"/>
    <path d="M 0 -35 L 3 -8 L 30 0 L 3 8 L 0 35 L -3 8 L -30 0 L -3 -8 Z" fill="#FFFFFF"/>
  </g>

  <g transform="translate(260, 680)">
    <circle cx="0" cy="0" r="18" fill="#FFFFFF" filter="url(#divineGlow)"/>
    <circle cx="0" cy="0" r="9" fill="#FFE259"/>
    <path d="M 0 -40 L 4 -10 L 35 0 L 4 10 L 0 40 L -4 10 L -35 0 L -4 -10 Z" fill="#FFFFFF"/>
  </g>

  <!-- Puntos Cardinales Sagrados -->
  <circle cx="400" cy="80" r="6" fill="#FFE259" filter="drop-shadow(0 0 6px #FFE259)"/>
  <circle cx="720" cy="400" r="6" fill="#FFE259" filter="drop-shadow(0 0 6px #FFE259)"/>
  <circle cx="400" cy="720" r="6" fill="#FFFFFF" filter="drop-shadow(0 0 6px #FFFFFF)"/>
  <circle cx="80" cy="400" r="6" fill="#FFE259" filter="drop-shadow(0 0 6px #FFE259)"/>
</svg>
`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 800px;
      height: 800px;
    }
  </style>
</head>
<body>
  ${masterpieceSvg}
</body>
</html>
`;

const htmlPath = path.join(__dirname, 'masterpiece.html');
fs.writeFileSync(htmlPath, html);

const outPng = path.join(targetDir, 'gods_lightning_masterpiece_8k.png');
const projectPng = path.join(projectAssetDir, 'gods_lightning_master.png');

console.log('Rendering 800x800 master artwork with Edge headless...');
try {
  execSync(`"${browserPath}" --headless --disable-gpu --window-size=800,800 --screenshot="${outPng}" "file:///${htmlPath.replace(/\\\\/g, '/')}"`);
  fs.copyFileSync(outPng, projectPng);
  console.log(`SUCCESS: Masterpiece saved to ${outPng} and ${projectPng}`);
} catch (e) {
  console.error('Error rendering:', e.message);
}
