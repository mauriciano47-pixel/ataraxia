import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        
        {/* PWA & Icon Tags */}
        <title>Ataraxia — Templo del Autodominio</title>
        <meta name="theme-color" content="#040406" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ataraxia" />
        
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            body, html, #root {
              background-color: #040406 !important;
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              overflow-x: hidden;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
