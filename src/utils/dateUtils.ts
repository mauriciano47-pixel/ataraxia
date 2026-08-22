/**
 * Retorna la fecha local en formato YYYY-MM-DD según la zona horaria del dispositivo del usuario.
 * Previene el bug de reinicio a las 20:00 (00:00 UTC) donde toISOString() cambia de día 4 horas antes.
 */
export function getLocalTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
