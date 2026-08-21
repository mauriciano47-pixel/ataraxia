const fs = require('fs');
const html = fs.readFileSync('C:/Users/mauro/.gemini/antigravity/brain/31439738-d723-46ab-a684-8dedf378f222/.system_generated/steps/540/content.md', 'utf8');
const scripts = [];
const regex = /<script\b[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  scripts.push(match[1]);
}
console.log('Scripts:', scripts);
