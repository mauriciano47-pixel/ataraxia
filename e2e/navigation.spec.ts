import { test, expect } from '@playwright/test';

test.describe('Ataraxia Suite de Rutas & Navegación', () => {
  const routes = [
    { path: '/trainer.html', name: 'Entrenador / Trainer' },
    { path: '/nutrition.html', name: 'Nutrición / Macro Tracker' },
    { path: '/progress.html', name: 'Progreso / Histórico' },
    { path: '/about.html', name: 'Acerca de Ataraxia' },
    { path: '/download.html', name: 'Portal de Descargas APK' },
  ];

  for (const route of routes) {
    test(`debe servir exitosamente la ruta ${route.name} (${route.path}) sin errores 404/500`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response).not.toBeNull();
      expect(response?.status()).toBe(200);

      // Verificamos que el contenedor adecuado esté presente (#root en Expo, .container en Portal APK)
      const containerSelector = route.path === '/download.html' ? '.container' : '#root';
      const container = page.locator(containerSelector);
      await expect(container).toBeAttached();
    });
  }
});
