const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = 'C:\\Users\\mauro\\.gemini\\antigravity\\brain\\621a4605-5ae2-493b-a00e-d175f7834788';
const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const options = [
  {
    name: 'opcion_1_rayo_clasico_oro',
    title: 'Opción 1: Rayo Clásico Imperial Oro 3D',
    desc: 'Zigzag clásico 3D con corte afilado en oro diamante y halo estelar.',
    svg: `
    <svg width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <radialGradient id="g1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFE259" stop-opacity="0.45"/>
          <stop offset="40%" stop-color="#D4AF37" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#040406" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="l1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="25%" stop-color="#FFFDE0"/>
          <stop offset="55%" stop-color="#FFE259"/>
          <stop offset="85%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </linearGradient>
        <linearGradient id="l1_r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFE259"/>
          <stop offset="30%" stop-color="#D4AF37"/>
          <stop offset="70%" stop-color="#B45309"/>
          <stop offset="100%" stop-color="#451A03"/>
        </linearGradient>
        <linearGradient id="plasma1" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="50%" stop-color="#FFFDE0"/>
          <stop offset="100%" stop-color="#FFFFFF"/>
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="175" fill="url(#g1)"/>
      <circle cx="200" cy="200" r="155" stroke="rgba(255,226,89,0.5)" stroke-width="2.5" stroke-dasharray="8,6" fill="none"/>
      <circle cx="200" cy="200" r="140" stroke="rgba(212,175,55,0.3)" stroke-width="1.5" fill="none"/>
      
      <polygon points="235,35 120,210 190,210 135,365 275,180 210,180" fill="#451A03" transform="translate(4,5)"/>
      <polygon points="235,35 120,210 190,210 135,365 275,180 210,180" stroke="#FFE259" stroke-width="7" fill="rgba(245,158,11,0.35)"/>
      <polygon points="235,35 205,210 135,365 275,180 210,180" fill="url(#l1_r)" stroke="#D4AF37" stroke-width="1"/>
      <polygon points="235,35 120,210 190,210 135,365 205,210" fill="url(#l1)" stroke="#FFFFFF" stroke-width="1.6"/>
      <path d="M 235 35 L 205 210 L 135 365" stroke="url(#plasma1)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      
      <circle cx="235" cy="35" r="4.5" fill="#FFFFFF"/>
      <circle cx="135" cy="365" r="5" fill="#FFFFFF"/>
      <circle cx="200" cy="45" r="3.5" fill="#FFE259"/>
      <circle cx="355" cy="200" r="3.5" fill="#FFE259"/>
      <circle cx="200" cy="355" r="3.5" fill="#FFFFFF"/>
      <circle cx="45" cy="200" r="3.5" fill="#FFE259"/>
    </svg>
    `
  },
  {
    name: 'opcion_2_rayo_zeus_laureles',
    title: 'Opción 2: Rayo de Zeus con Corona de Laureles',
    desc: 'Rayo imperial grecorromano envuelto en corona de hojas de laurel de oro.',
    svg: `
    <svg width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <radialGradient id="g2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFE259" stop-opacity="0.5"/>
          <stop offset="40%" stop-color="#D4AF37" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#040406" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="laurelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFDE0"/>
          <stop offset="35%" stop-color="#FFE259"/>
          <stop offset="70%" stop-color="#D4AF37"/>
          <stop offset="100%" stop-color="#8A6615"/>
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="175" fill="url(#g2)"/>
      
      <!-- Laureles Izquierda -->
      <g fill="url(#laurelGrad)" stroke="#FFE259" stroke-width="1">
        <path d="M 105 100 C 85 95, 70 110, 85 125 C 100 125, 110 115, 105 100 Z"/>
        <path d="M 80 140 C 60 135, 50 155, 65 170 C 80 170, 90 155, 80 140 Z"/>
        <path d="M 75 190 C 55 190, 50 210, 65 225 C 80 225, 85 210, 75 190 Z"/>
        <path d="M 90 245 C 75 250, 75 270, 90 280 C 105 275, 105 260, 90 245 Z"/>
        <path d="M 120 295 C 110 305, 120 325, 135 325 C 145 315, 140 300, 120 295 Z"/>
        <path d="M 160 325 C 155 340, 170 350, 185 345 C 190 330, 175 320, 160 325 Z"/>
      </g>

      <!-- Laureles Derecha -->
      <g fill="url(#laurelGrad)" stroke="#FFE259" stroke-width="1">
        <path d="M 295 100 C 315 95, 330 110, 315 125 C 300 125, 290 115, 295 100 Z"/>
        <path d="M 320 140 C 340 135, 350 155, 335 170 C 320 170, 310 155, 320 140 Z"/>
        <path d="M 325 190 C 345 190, 350 210, 335 225 C 320 225, 315 210, 325 190 Z"/>
        <path d="M 310 245 C 325 250, 325 270, 310 280 C 295 275, 295 260, 310 245 Z"/>
        <path d="M 280 295 C 290 305, 280 325, 265 325 C 255 315, 260 300, 280 295 Z"/>
        <path d="M 240 325 C 245 340, 230 350, 215 345 C 210 330, 225 320, 240 325 Z"/>
      </g>

      <polygon points="225,50 135,200 195,200 150,340 260,175 205,175" fill="#451A03" transform="translate(4,5)"/>
      <polygon points="225,50 135,200 195,200 150,340 260,175 205,175" stroke="#FFE259" stroke-width="5" fill="#D4AF37"/>
      <polygon points="225,50 135,200 195,200 150,340 205,200" fill="#FFFDE0"/>
      <circle cx="150" cy="340" r="6" fill="#FFFFFF"/>
      <circle cx="225" cy="50" r="5" fill="#FFFFFF"/>
    </svg>
    `
  },
  {
    name: 'opcion_3_medallon_onix_escudo',
    title: 'Opción 3: Medallón de Ónix & Escudo Espartano',
    desc: 'Medallón circular de piedra ónix con bisel grueso de 24k y rayo en relieve.',
    svg: `
    <svg width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <radialGradient id="onyxFull" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#1E2338"/>
          <stop offset="55%" stop-color="#0F1322"/>
          <stop offset="85%" stop-color="#080A14"/>
          <stop offset="100%" stop-color="#030408"/>
        </radialGradient>
        <linearGradient id="goldBezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFDE0"/>
          <stop offset="25%" stop-color="#FFE259"/>
          <stop offset="50%" stop-color="#D4AF37"/>
          <stop offset="75%" stop-color="#8A6615"/>
          <stop offset="100%" stop-color="#FFE259"/>
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="170" fill="url(#onyxFull)"/>
      <circle cx="200" cy="200" r="170" stroke="url(#goldBezel)" stroke-width="12" fill="none"/>
      <circle cx="200" cy="200" r="156" stroke="rgba(255,253,224,0.7)" stroke-width="2" fill="none"/>
      <circle cx="200" cy="200" r="140" stroke="rgba(212,175,55,0.35)" stroke-width="1.5" stroke-dasharray="6,8" fill="none"/>

      <polygon points="225,65 140,205 195,205 155,330 255,185 205,185" fill="#451A03" transform="translate(3.5,4.5)"/>
      <polygon points="225,65 140,205 195,205 155,330 255,185 205,185" stroke="#FFE259" stroke-width="4.5" fill="#D4AF37"/>
      <polygon points="225,65 140,205 195,205 155,330 205,205" fill="#FFFDE0"/>
      <circle cx="155" cy="330" r="5.5" fill="#FFFFFF"/>
    </svg>
    `
  },
  {
    name: 'opcion_4_rayo_plasma_cyber',
    title: 'Opción 4: Rayo de Plasma Cyber-Obsidian',
    desc: 'Rayo cyber-obsidian con núcleo blanco incandescente y arcos tesla de plasma.',
    svg: `
    <svg width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <radialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#00C6FF" stop-opacity="0.35"/>
          <stop offset="40%" stop-color="#FFE259" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#040406" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="170" fill="url(#plasmaGlow)"/>

      <!-- Arcos Tesla Secundarios -->
      <path d="M 130 150 L 95 185 L 110 190 L 75 235 L 88 240 L 45 290" stroke="#00C6FF" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.9"/>
      <path d="M 265 140 L 300 175 L 285 180 L 320 215 L 305 220 L 345 260" stroke="#FFE259" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.9"/>

      <polygon points="235,40 120,210 190,210 135,365 275,180 210,180" stroke="#00C6FF" stroke-width="10" fill="rgba(0,198,255,0.25)"/>
      <polygon points="235,40 120,210 190,210 135,365 275,180 210,180" stroke="#FFE259" stroke-width="4.5" fill="#D4AF37"/>
      <polygon points="235,40 120,210 190,210 135,365 210,210" fill="#FFFFFF"/>
      <circle cx="135" cy="365" r="7" fill="#00C6FF"/>
      <circle cx="235" cy="40" r="6" fill="#FFFFFF"/>
    </svg>
    `
  }
];

// Generar cada imagen individual
options.forEach((opt) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #040406;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 440px;
        height: 520px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #FFFFFF;
        box-sizing: border-box;
      }
      .card {
        background: #080A12;
        border: 2px solid rgba(212, 175, 55, 0.45);
        border-radius: 24px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 400px;
        box-sizing: border-box;
      }
      h2 {
        color: #FFE259;
        font-size: 17px;
        margin: 12px 0 4px 0;
        text-align: center;
        letter-spacing: 1px;
      }
      p {
        color: #94A3B8;
        font-size: 12px;
        text-align: center;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="card">
      ${opt.svg}
      <h2>${opt.title}</h2>
      <p>${opt.desc}</p>
    </div>
  </body>
  </html>
  `;
  const tmpHtml = path.join(__dirname, `${opt.name}.html`);
  fs.writeFileSync(tmpHtml, html);
  const outPng = path.join(targetDir, `${opt.name}.png`);
  try {
    execSync(`"${browserPath}" --headless --disable-gpu --window-size=440,520 --screenshot="${outPng}" "file:///${tmpHtml.replace(/\\\\/g, '/')}"`);
    console.log(`Rendered: ${outPng}`);
  } catch (e) {
    console.error(`Error rendering ${opt.name}:`, e.message);
  }
});
