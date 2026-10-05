/**
 * Ataraxia — Central Silent Production Logger (Zero-Leakage & Clean Code Standard)
 * Titularidad: Mauricio Uribe Maldonado
 */

export const logger = {
  log: (...args: any[]) => {
    // In strict production, keep silent to avoid leaking telemetry or overhead
  },
  info: (...args: any[]) => {
    // Controlled info logger
  },
  warn: (...args: any[]) => {
    // Controlled warning dispatcher
  },
  error: (...args: any[]) => {
    // Controlled error logger
  },
};
