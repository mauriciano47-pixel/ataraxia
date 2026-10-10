import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getLocalTodayDateString } from '../src/utils/dateUtils.ts';

describe('Ataraxia — Utilidades Temporales & Blindaje de Zona Horaria (dateUtils)', () => {
  it('1. Debe retornar la fecha local en formato canónico YYYY-MM-DD', () => {
    const today = getLocalTodayDateString();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/, 'El formato debe ser estrictamente YYYY-MM-DD');

    const [year, month, day] = today.split('-').map(Number);
    assert.ok(year >= 2026, `El año debe ser válido: ${year}`);
    assert.ok(month >= 1 && month <= 12, `El mes debe estar entre 1 y 12: ${month}`);
    assert.ok(day >= 1 && day <= 31, `El día debe estar entre 1 y 31: ${day}`);
  });

  it('2. Debe coincidir con la fecha local del sistema (evitando desfase UTC de 4 horas a las 20:00)', () => {
    const d = new Date();
    const expectedYear = d.getFullYear();
    const expectedMonth = String(d.getMonth() + 1).padStart(2, '0');
    const expectedDay = String(d.getDate()).padStart(2, '0');
    const expected = `${expectedYear}-${expectedMonth}-${expectedDay}`;

    assert.equal(getLocalTodayDateString(), expected);
  });
});
