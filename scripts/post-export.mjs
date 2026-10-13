import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

if (fs.existsSync(distDir)) {
  // 1. Limpieza de tags <title data-rh="true"></title> vacíos que bloquean document.title
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    if (file.endsWith('.html')) {
      const fullPath = path.join(distDir, file);
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<title data-rh="true"></title>')) {
        content = content.replace(/<title data-rh="true"><\/title>/g, '');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`[PostExport] Sanitizado tag title vacío en ${file}`);
      }
    }
  }

  // 2. Generación de fallbacks SPA para hosting estático
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, path.join(distDir, '200.html'));
    fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));
    console.log('[PostExport] Generados fallbacks 200.html y 404.html');
  }
}
