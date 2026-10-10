import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { STOIC_PRINCIPLES, getDailyStoicPrinciple } from '../src/constants/stoicPrinciples.ts';

describe('Ataraxia — Bóveda de Principios Estoicos & Rotación Diaria (stoicPrinciples)', () => {
  it('1. Debe contener un catálogo completo de principios estoicos con citas de los grandes maestros', () => {
    assert.ok(STOIC_PRINCIPLES.length >= 20, `Debe haber al menos 20 principios: hay ${STOIC_PRINCIPLES.length}`);
    const authors = new Set(STOIC_PRINCIPLES.map(p => p.author));
    assert.ok(authors.has('Marco Aurelio'));
    assert.ok(authors.has('Epicteto'));
    assert.ok(authors.has('Séneca'));

    STOIC_PRINCIPLES.forEach(p => {
      assert.ok(p.id && p.id.startsWith('sp_'), `ID válido con prefijo sp_: ${p.id}`);
      assert.ok(p.quote && p.quote.length > 10, `Cita estoica sustancial: ${p.id}`);
      assert.ok(p.author && p.author.length > 3, `Autor identificado: ${p.author}`);
      assert.ok(p.category, `Categoría asignada: ${p.category}`);
    });
  });

  it('2. Debe rotar determinísticamente día por día sin colisiones inmediatas', () => {
    const day1 = getDailyStoicPrinciple('2026-10-10');
    const day2 = getDailyStoicPrinciple('2026-10-11');
    const day3 = getDailyStoicPrinciple('2026-10-12');

    assert.ok(day1.id);
    assert.ok(day2.id);
    assert.ok(day3.id);
    // Verificar que días continuos ofrecen variedad estoica
    assert.notEqual(day1.id, day2.id, 'Día 1 y Día 2 no deben repetir cita');
    assert.notEqual(day2.id, day3.id, 'Día 2 y Día 3 no deben repetir cita');
  });

  it('3. Debe ser idempotente: misma fecha siempre produce exactamente el mismo principio', () => {
    const runA = getDailyStoicPrinciple('2026-10-15');
    const runB = getDailyStoicPrinciple('2026-10-15');
    assert.equal(runA.id, runB.id);
    assert.equal(runA.quote, runB.quote);
  });
});
