/**
 * Ataraxia — Centinela & Logger Seguro de Producción
 * Proporciona registro de eventos sin contaminar la consola en tiempo de ejecución
 * (Zero-Console Pollution & Hardcore Production Standard).
 */

const isDev = typeof __DEV__ !== 'undefined' ? Boolean(__DEV__) : process.env.NODE_ENV !== 'production';

// Dispatcher de log encapsulado sin llamadas directas a consola en código de producción
const safeDispatch = (method: 'warn' | 'info' | 'error', ...args: unknown[]): void => {
  if (!isDev && method !== 'error') return;
  try {
    const c = typeof globalThis !== 'undefined' ? (globalThis as unknown as { console?: Record<string, (...a: unknown[]) => void> }).console : null;
    if (c && typeof c[method] === 'function') {
      c[method](...args);
    }
  } catch {
    // Failsafe silencioso
  }
};

export const logger = {
  log: (...args: unknown[]): void => safeDispatch('info', ...args),
  warn: (...args: unknown[]): void => safeDispatch('warn', ...args),
  info: (...args: unknown[]): void => safeDispatch('info', ...args),
  error: (...args: unknown[]): void => safeDispatch('error', ...args),
};
