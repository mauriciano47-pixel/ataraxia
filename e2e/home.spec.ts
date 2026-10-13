import { test, expect } from '@playwright/test';

test.describe('Ataraxia Home Page (Templo del Autodominio)', () => {
  test('debe cargar la página de inicio con título y tema ceremonial correcto', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/');

    // 1. Título oficial de Ataraxia
    await expect(page).toHaveTitle(/Ataraxia/);

    // 2. Contenedor principal React Native Web
    const root = page.locator('#root');
    await expect(root).toBeAttached();

    // 3. Meta etiqueta de tema OLED #040406
    const themeColorMeta = page.locator('meta[name="theme-color"]');
    await expect(themeColorMeta).toHaveAttribute('content', '#040406');

    // 4. Verificación de cero errores JS fatales en tiempo de ejecución
    // Se filtran advertencias de reconciliación de hidratación de React 19 inherentes al export estático
    const fatalErrors = pageErrors.filter((err) => {
      const msg = err.message || '';
      return !msg.includes('Minified React error #418') && 
             !msg.includes('Minified React error #423') && 
             !msg.includes('Hydration');
    });

    if (fatalErrors.length > 0) {
      console.error('[Fatal Error Detected]:', fatalErrors.map((e) => e.message));
    }
    expect(fatalErrors.length).toBe(0);
  });

  test('debe contener el viewport adaptativo para dispositivos móviles', async ({ page }) => {
    await page.goto('/');
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
  });
});
