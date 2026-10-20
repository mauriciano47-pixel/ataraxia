#!/usr/bin/env node
/**
 * ATARAXIA — Shift-Left Git Pre-Push Quality Gate (Big Tech Standard)
 * Ejecuta validación de tipos TypeScript, auditoría de secretos Zero-Leakage y suite de pruebas
 * antes de permitir cualquier subida al repositorio remoto.
 */
import { execSync } from 'node:child_process';

console.log('🛡️ [ATARAXIA Shift-Left Gate] Ejecutando verificación pre-push...');

try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  execSync('npm run security:audit', { stdio: 'inherit' });
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ [ATARAXIA Shift-Left Gate] Verificación superada al 100%. Push autorizado.');
  process.exit(0);
} catch (error) {
  console.error('❌ [ATARAXIA Shift-Left Gate] Push bloqueado por fallo en Quality Gate.');
  process.exit(1);
}
