const https = require('https');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const match = envContent.match(/EXPO_PUBLIC_GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match[1].trim();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const models = (json.models || []).map(m => m.name);
      console.log('Available models:', models.filter(m => m.includes('image') || m.includes('gemini') || m.includes('imagen')));
    } catch (e) {
      console.error('Error parsing:', data);
    }
  });
});
