import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8089;
const apkPath = "C:\\Users\\mauro\\OneDrive\\Desktop\\Ataraxia_Stoic_Fitness_v3.7.1.apk";

const server = http.createServer((req, res) => {
  if (req.url === '/download' || req.url === '/Ataraxia.apk') {
    if (!fs.existsSync(apkPath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('APK no encontrado en el escritorio.');
    }
    const stat = fs.statSync(apkPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="Ataraxia_Stoic_Fitness_v3.7.1.apk"'
    });
    const stream = fs.createReadStream(apkPath);
    stream.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Descargar Ataraxia APK</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #050507; color: #fff; text-align: center; padding: 40px 20px; }
          .card { background: #0F172A; border: 1.5px solid #D4AF37; border-radius: 20px; padding: 30px 20px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 30px rgba(212,175,55,0.2); }
          h1 { color: #FFE259; font-size: 22px; margin-bottom: 8px; }
          p { color: #94A3B8; font-size: 13px; margin-bottom: 24px; line-height: 1.5; }
          .btn { display: block; background: linear-gradient(135deg, #D4AF37, #F59E0B); color: #000; font-weight: 900; font-size: 16px; padding: 16px 20px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 15px rgba(245,158,11,0.4); }
          .meta { margin-top: 20px; font-size: 11px; color: #64748B; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚡ ATARAXIA NATIVA</h1>
          <p>Podómetro Biomecánico 24/7 con soporte para Coprocesador de Hardware y Pantalla Apagada.</p>
          <a class="btn" href="/download">📥 DESCARGAR APK DIRECTO</a>
          <div class="meta">Versión 3.7.1 • Tamaño: 270 MB (Wi-Fi Ultra Rápido)</div>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de descarga local activo en http://10.44.62.242:${PORT}/`);
});
