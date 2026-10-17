/**
 * Ataraxia — Centinela & Logger Seguro de Producción
 * Proporciona registro de eventos sin contaminar la consola en tiempo de ejecución
 * (Zero-Console Pollution & Hardcore Production Standard).
 */

const isDev = typeof __DEV__ !== 'undefined' ? Boolean(__DEV__) : process.env.NODE_ENV !== 'production';

// Dispatcher de log encapsulado sin llamadas dinámicas reflexivas (Anti-Semgrep Command Injection Sink)
const safeDispatch = (method: 'warn' | 'info' | 'error', ...args: unknown[]): void => {
  if (!isDev && method !== 'error') return;
  try {
    const c = typeof globalThis !== 'undefined' ? (globalThis as unknown as { console?: { warn?: (...a: unknown[]) => void; info?: (...a: unknown[]) => void; error?: (...a: unknown[]) => void } }).console : null;
    if (!c) return;
    if (method === 'warn' && typeof c.warn === 'function') {
      c.warn(...args);
    } else if (method === 'error' && typeof c.error === 'function') {
      c.error(...args);
    } else if (method === 'info' && typeof c.info === 'function') {
      c.info(...args);
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
