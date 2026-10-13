import { test, expect } from '@playwright/test';

test.describe('Ataraxia Persistencia de Estado Local (SafeStorage)', () => {
  test('debe persistir llaves de sesión y pacto estoico en localStorage', async ({ page }) => {
    await page.goto('/');

    // Inyectar estado en localStorage
    await page.evaluate(() => {
      localStorage.setItem('ataraxia_temple_access_granted_v2', 'true');
      localStorage.setItem('ataraxia_daily_step_goal', '10000');
    });

    // Recargar la página para emular hidratación post-cierre
    await page.reload();

    // Comprobar que los valores persisten
    const accessGranted = await page.evaluate(() => {
      return localStorage.getItem('ataraxia_temple_access_granted_v2');
    });
    const stepGoal = await page.evaluate(() => {
      return localStorage.getItem('ataraxia_daily_step_goal');
    });

    expect(accessGranted).toBe('true');
    expect(stepGoal).toBe('10000');
  });

  test('debe manejar adecuadamente la limpieza o reseteo sin romper el contexto', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.setItem('ataraxia_temp_test_key', 'stoic_discipline');
    });

    let val = await page.evaluate(() => localStorage.getItem('ataraxia_temp_test_key'));
    expect(val).toBe('stoic_discipline');

    await page.evaluate(() => {
      localStorage.removeItem('ataraxia_temp_test_key');
    });

    val = await page.evaluate(() => localStorage.getItem('ataraxia_temp_test_key'));
    expect(val).toBeNull();
  });
});
