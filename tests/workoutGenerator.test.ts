import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildFallbackAIRoutine } from '../src/lib/workoutGenerator.ts';

describe('Ataraxia — Generador Resiliente de Rutinas de Entrenamiento (workoutGenerator)', () => {
  it('1. Debe generar rutina de Calistenia Espartana cuando el equipo es "Peso Corporal"', () => {
    const routine = buildFallbackAIRoutine(45, 'Fuerza', 'Peso Corporal');
    assert.match(routine.title, /Calistenia Espartana Fuerza \(45 min\)/);
    assert.equal(routine.exercises.length, 4);
    assert.ok(routine.exercises.some(e => e.n.includes('Flexiones Declinadas')));
    assert.ok(routine.exercises.some(e => e.n.includes('Sentadillas Explosivas')));
    assert.ok(routine.exercises.some(e => e.muscleGroup === 'Core'));
  });

  it('2. Debe generar rutina de Empuje (Push) con ejercicios pesados de pecho y hombro', () => {
    const routine = buildFallbackAIRoutine(60, 'Empuje y Deltoides', 'Gimnasio');
    assert.match(routine.title, /Poder de Empuje & Hombros \(60 min\)/);
    assert.equal(routine.exercises.length, 4);
    assert.ok(routine.exercises.some(e => e.n.includes('Press de Banca')));
    assert.ok(routine.exercises.some(e => e.n.includes('Press Militar')));
    assert.ok(routine.exercises.some(e => e.muscleGroup === 'Pecho'));
    assert.ok(routine.exercises.some(e => e.muscleGroup === 'Hombros'));
  });

  it('3. Debe generar rutina de Tracción (Pull) con peso muerto y remos', () => {
    const routine = buildFallbackAIRoutine(50, 'Tracción Espalda', 'Gimnasio');
    assert.match(routine.title, /Densidad de Espalda & Bíceps \(50 min\)/);
    assert.equal(routine.exercises.length, 4);
    assert.ok(routine.exercises.some(e => e.n.includes('Peso Muerto Rumano')));
    assert.ok(routine.exercises.some(e => e.n.includes('Remo Pendlay')));
    assert.ok(routine.exercises.some(e => e.muscleGroup === 'Espalda'));
  });

  it('4. Debe generar rutina Full Body por defecto para cualquier otro enfoque', () => {
    const routine = buildFallbackAIRoutine(40, 'Acondicionamiento General', 'Mancuernas');
    assert.match(routine.title, /Fuerza Full Body Estoica \(40 min\)/);
    assert.equal(routine.exercises.length, 5);
    assert.ok(routine.exercises.some(e => e.n.includes('Sentadilla Trasera')));
    assert.ok(routine.exercises.some(e => e.n.includes('Press Inclinado')));
    assert.ok(routine.exercises.some(e => e.muscleGroup === 'Piernas'));
  });
});
