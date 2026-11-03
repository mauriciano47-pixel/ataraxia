import test from 'node:test';
import assert from 'node:assert';
import {
  isVersionOutdated,
  checkAppUpdate,
  dismissAppUpdate,
  clearDismissedUpdate,
} from '../src/services/updateCheckService.ts';
import { SafeStorage } from '../src/utils/safeStorage.ts';

test('Ataraxia — Verificador Resiliente de Actualizaciones (UpdateCheckService)', async (t) => {
  await t.test('1. [SemVer Evaluation] Debe identificar versiones obsoletas con precisión matemática', () => {
    // Casos donde hay actualización
    assert.strictEqual(isVersionOutdated('2.2.0', '3.0.0'), true);
    assert.strictEqual(isVersionOutdated('2.9.2', '3.0.0'), true);
    assert.strictEqual(isVersionOutdated('v2.4.0', 'v3.0.0'), true);
    assert.strictEqual(isVersionOutdated('3.0.0', '3.0.1'), true);
    assert.strictEqual(isVersionOutdated('3.0.0', '3.1.0'), true);

    // Casos donde NO hay actualización
    assert.strictEqual(isVersionOutdated('3.0.0', '3.0.0'), false);
    assert.strictEqual(isVersionOutdated('v3.0.0', '3.0.0'), false);
    assert.strictEqual(isVersionOutdated('3.1.0', '3.0.0'), false);
    assert.strictEqual(isVersionOutdated('4.0.0', '3.0.0'), false);
    assert.strictEqual(isVersionOutdated('', '3.0.0'), false);
    assert.strictEqual(isVersionOutdated('3.0.0', ''), false);
  });

  await t.test('2. [Fallback & Anti-Timeout] Debe degradar elegantemente ante URL remota inalcanzable', async () => {
    const result = await checkAppUpdate('2.4.0', {
      remoteUrl: 'https://dominio-inexistente-12345.local/version.json',
      timeoutMs: 150,
    });

    assert.strictEqual(typeof result, 'object');
    assert.strictEqual(result.isUpdateAvailable, false);
    assert.strictEqual(result.currentVersion, '2.4.0');
  });

  await t.test('3. [User Dismiss Flow] Debe respetar la decisión del usuario al descartar actualización opcional', () => {
    const targetVersion = '99.9.9';
    clearDismissedUpdate(targetVersion);

    // Simular que el usuario descarta la versión 99.9.9
    dismissAppUpdate(targetVersion);
    assert.strictEqual(SafeStorage.getItem(`@ataraxia_dismissed_update_${targetVersion}`), 'true');

    // Limpieza
    clearDismissedUpdate(targetVersion);
    assert.strictEqual(SafeStorage.getItem(`@ataraxia_dismissed_update_${targetVersion}`), null);
  });
});
