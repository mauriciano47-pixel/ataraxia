const https = require('https');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const match = envContent.match(/EXPO_PUBLIC_GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match[1].trim();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const targetDir = 'C:\\Users\\mauro\\.gemini\\antigravity\\brain\\621a4605-5ae2-493b-a00e-d175f7834788';

const prompts = [
  {
    name: 'opcion_1_rayo_clasico_oro',
    prompt: 'Generate an image of a 3D golden lightning bolt logo icon. Classic sharp diagonal zigzag thunderbolt sculpted in solid polished 24k gold with bevelled edges, soft golden glowing rim, pitch black background #050507, luxury minimal emblem, 8k resolution.'
  },
  {
    name: 'opcion_2_rayo_zeus_laureles',
    prompt: 'Generate an image of a majestic 3D golden lightning bolt emblem for an ancient stoic luxury temple. Classic sharp thunderbolt of Zeus in polished 24k gold, surrounded by an imperial Roman laurel wreath made of sculpted gold leaves, pitch black background #050507, dramatic rim lighting.'
  },
  {
    name: 'opcion_3_medallon_onix_escudo',
    prompt: 'Generate an image of a luxury round spartan stoic medallion made of black onyx stone with a heavy 24k gold beveled rim. In the center, an embossed sharp golden lightning bolt with engraved geometric sunburst rays, pure black background #050507.'
  },
  {
    name: 'opcion_4_rayo_plasma_cyber',
    prompt: 'Generate an image of a cyber-obsidian electric thunderbolt icon, sharp angular lightning silhouette with glowing white-hot core, intense amber and gold neon plasma aura, electric sparks emitting from edges, pitch black background #050507.'
  }
];

function generateWithGemini(promptObj) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      contents: [{
        parts: [{ text: promptObj.prompt }]
      }],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"]
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`Generating with Gemini Flash Image: ${promptObj.name}...`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts) {
            const parts = json.candidates[0].content.parts;
            const imgPart = parts.find(p => p.inlineData);
            if (imgPart) {
              const buffer = Buffer.from(imgPart.inlineData.data, 'base64');
              const ext = imgPart.inlineData.mimeType.includes('png') ? 'png' : 'jpg';
              const filePath = path.join(targetDir, `${promptObj.name}.${ext}`);
              fs.writeFileSync(filePath, buffer);
              console.log(`SUCCESS saved: ${filePath}`);
              return resolve(filePath);
            }
          }
          console.error(`Failed ${promptObj.name}:`, JSON.stringify(json).slice(0, 300));
          resolve(null);
        } catch (e) {
          console.error(`Parse error:`, e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  for (const p of prompts) {
    await generateWithGemini(p);
  }
}

run();
