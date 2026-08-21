const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copiar archivos de public a dist
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  for (const file of files) {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
      console.log(`[postbuild] Copied ${file} to dist/`);
    }
  }
}

// Generar SPA fallbacks
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, path.join(distDir, '200.html'));
  fs.copyFileSync(indexPath, path.join(distDir, '404.html'));
  console.log('[postbuild] Created 200.html & 404.html in dist/');
}
