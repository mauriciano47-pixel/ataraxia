/**
 * Ataraxia — Suite de Pruebas Unitarias de Constelación del Cosmos & Gestión de Fechas
 * Titularidad: Mauricio Uribe Maldonado
 */

export function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateLast30DaysKeys(endDate = new Date()): string[] {
  const keys: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    keys.push(getTodayDateKey(d));
  }
  return keys;
}

export function calculateDisciplineStreak(historyDays: { [dateKey: string]: { completed: boolean } }): number {
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getTodayDateKey(d);
    
    if (historyDays[key] && historyDays[key].completed) {
      streak++;
    } else {
      // Si hoy aún no se completa, permitir evaluar racha hasta ayer
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

describe('Ataraxia Constellation & Date Utilities', () => {
  test('Debe formatear fecha en clave ISO YYYY-MM-DD', () => {
    const fixedDate = new Date(2026, 9, 5); // 5 de Octubre de 2026
    expect(getTodayDateKey(fixedDate)).toBe('2026-10-05');
  });

  test('Debe generar exactamente 30 días para el mapa estelar del cosmos', () => {
    const keys = generateLast30DaysKeys();
    expect(keys.length).toBe(30);
    expect(keys[keys.length - 1]).toBe(getTodayDateKey());
  });

  test('Debe calcular racha ininterrumpida de disciplina', () => {
    const today = new Date();
    const todayKey = getTodayDateKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getTodayDateKey(yesterday);

    const mockHistory = {
      [todayKey]: { completed: true },
      [yesterdayKey]: { completed: true },
    };

    expect(calculateDisciplineStreak(mockHistory)).toBe(2);
  });
});
