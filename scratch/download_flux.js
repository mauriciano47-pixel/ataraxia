const https = require('https');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const targetDir = 'C:\\Users\\mauro\\.gemini\\antigravity\\brain\\621a4605-5ae2-493b-a00e-d175f7834788';
const projectAssetDir = 'c:\\Users\\mauro\\OneDrive\\Documentos\\ATARAXIA_APP\\ataraxia\\assets\\images';

const prompts = [
  {
    name: 'flux_zeus_thunder_god_3d',
    prompt: 'Epic 3D golden lightning bolt of Zeus, photorealistic Octane Render 8k, forged from solid 24k polished gold, glowing white diamond sharp edges, intense inner neon golden plasma, pure OLED pitch black background, luxury game logo emblem, hyperdetailed masterpiece, cinematic volumetric lighting'
  },
  {
    name: 'flux_olympian_laurel_crest',
    prompt: 'Majestic golden lightning bolt of Zeus wrapped in imperial Roman laurel wreath made of sculpted 24k gold, glowing white neon plasma core, pure black background, dramatic cinematic rim lighting, 3D unreal engine 5 render, luxury medallion logo'
  }
];

function download(item) {
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(item.prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=flux&nologo=true&seed=999`;
    console.log(`Downloading Flux AI for ${item.name}...`);
    
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirRes) => {
          const chunks = [];
          redirRes.on('data', c => chunks.push(c));
          redirRes.on('end', () => {
            const buf = Buffer.concat(chunks);
            const outPath = path.join(targetDir, `${item.name}.jpg`);
            fs.writeFileSync(outPath, buf);
            fs.writeFileSync(path.join(projectAssetDir, 'gods_lightning_master.png'), buf);
            console.log(`SUCCESS: Saved ${buf.length} bytes to ${outPath}`);
            resolve(true);
          });
        });
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const outPath = path.join(targetDir, `${item.name}.jpg`);
        fs.writeFileSync(outPath, buf);
        fs.writeFileSync(path.join(projectAssetDir, 'gods_lightning_master.png'), buf);
        console.log(`SUCCESS: Saved ${buf.length} bytes to ${outPath}`);
        resolve(true);
      });
    }).on('error', (e) => {
      console.error('Error:', e.message);
      resolve(false);
    });
  });
}

async function run() {
  for (const p of prompts) {
    await download(p);
  }
}

run();
