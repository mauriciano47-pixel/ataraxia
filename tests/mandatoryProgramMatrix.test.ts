import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { MANDATORY_PROGRAM_MATRIX } from '../src/constants/mandatoryProgramMatrix.ts';
import type { LegendaryPath, EquipmentType } from '../src/types/onboarding.ts';

describe('Ataraxia — Matriz de Programas de Entrenamiento Obligatorios (mandatoryProgramMatrix)', () => {
  const paths: LegendaryPath[] = ['spartan', 'hoplite', 'apollo', 'philosopher'];
  const equipments: EquipmentType[] = ['gym', 'home_dumbbell', 'calisthenics'];

  it('1. Debe cubrir las 4 Sendas Legendarias y 3 Modalidades de Equipamiento (12 combinaciones)', () => {
    for (const path of paths) {
      assert.ok(MANDATORY_PROGRAM_MATRIX[path], `La senda '${path}' debe estar definida`);
      for (const eq of equipments) {
        const routine = MANDATORY_PROGRAM_MATRIX[path][eq];
        assert.ok(routine, `La combinación ${path} + ${eq} debe estar definida`);
        assert.ok(routine.name.length > 5, `El nombre de la rutina debe ser descriptivo`);
        assert.ok(routine.focus.length > 5, `El foco debe estar especificado`);
        assert.ok(routine.equipmentLabel.length > 0, `La etiqueta de equipo debe estar definida`);
        assert.ok(Array.isArray(routine.exercises), `Los ejercicios deben ser un array`);
        assert.ok(routine.exercises.length >= 4, `Cada rutina debe contener al menos 4 ejercicios estructurados`);
      }
    }
  });

  it('2. Todos los ejercicios deben contar con parámetros técnicos válidos (ID, RPE, series y Cues biomecánicas)', () => {
    const seenIds = new Set<string>();

    for (const path of paths) {
      for (const eq of equipments) {
        const routine = MANDATORY_PROGRAM_MATRIX[path][eq];
        for (const ex of routine.exercises) {
          assert.ok(ex.id && ex.id.length > 0, `El ID de ejercicio debe existir`);
          assert.ok(!seenIds.has(ex.id), `El ID '${ex.id}' no debe estar duplicado en la matriz`);
          seenIds.add(ex.id);

          assert.ok(ex.n && ex.n.length > 3, `El nombre del ejercicio debe ser claro: ${ex.id}`);
          assert.ok(ex.s && ex.s.length > 3, `Las series y repeticiones deben estar definidas: ${ex.s}`);
          assert.ok(ex.targetRpe >= 7.0 && ex.targetRpe <= 10.0, `El RPE debe estar en rango de esfuerzo 7-10: ${ex.targetRpe}`);
          assert.ok(ex.muscleGroup && ex.muscleGroup.length > 2, `El grupo muscular debe estar definido: ${ex.muscleGroup}`);
          assert.ok(ex.cue && ex.cue.length > 5, `La instrucción biomecánica (cue) debe ser instructiva: ${ex.cue}`);
        }
      }
    }

    assert.ok(seenIds.size >= 48, `Debe haber al menos 48 ejercicios únicos en la matriz global: se hallaron ${seenIds.size}`);
  });
});
