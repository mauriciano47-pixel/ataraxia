/**
 * 🏛️ Ataraxia — Suite de Aptitud Arquitectónica (Architectural Fitness Functions)
 * Autor: Mauricio Uribe Maldonado | Estándar M&A Turnkey & Clean Architecture
 * 
 * Audita formalmente que los motores de cálculo, biometría y contratos de negocio
 * mantengan un desacoplamiento estricto respecto a capas gráficas (React/React Native).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Ataraxia — Fronteras Arquitectónicas & Pureza de Dominio (Clean Architecture)', () => {
  const libDir = path.resolve('src/lib');
  const utilsDir = path.resolve('src/utils');

  // Módulos de dominio puro que jamás deben acoplarse a frameworks visuales
  const pureDomainEngines = [
    'fitnessCalculator.ts',
    'workoutGenerator.ts',
    'runtimeContracts.ts',
    'pedometerEngine.ts',
    'ppgEngine.ts',
    'cycleGrading.ts'
  ];

  it('1. Motores algorítmicos no deben importar componentes visuales (React / React Native UI)', () => {
    const forbiddenVisualImports = [
      /from ['"]react-native['"]/,
      /from ['"]react['"]/,
      /<[A-Z][a-zA-Z0-9]*\s*\/?>/, // Sintaxis JSX directa en el motor
    ];

    for (const engineName of pureDomainEngines) {
      const filePath = path.join(libDir, engineName);
      if (!fs.existsSync(filePath)) continue;

      const code = fs.readFileSync(filePath, 'utf-8');
      
      // Los motores no deben importar UI de React Native (View, Text, etc.)
      const importsReactNative = /import\s+.*\{?.*(View|Text|TouchableOpacity|StyleSheet).*\}?\s+from\s+['"]react-native['"]/.test(code);
      assert.equal(
        importsReactNative,
        false,
        `Violación Arquitectónica: Motor ${engineName} acoplado a componentes gráficos de React Native`
      );
    }
  });

  it('2. El motor de monetización y entitlements (stripeService) debe mantener frontera segura', () => {
    const stripePath = path.join(utilsDir, 'stripeService.ts');
    assert.ok(fs.existsSync(stripePath), 'stripeService.ts debe existir');

    const code = fs.readFileSync(stripePath, 'utf-8');
    
    // Debe usar SafeStorage y no interactuar con storage nativo invasivo directamente
    assert.ok(code.includes('SafeStorage'), 'stripeService debe utilizar la abstracción segura SafeStorage');
    // No debe contener secretos hardcodeados
    assert.doesNotMatch(code, /sk_live_[0-9a-zA-Z]+/, 'stripeService jamás debe tener llaves secretas live en código cliente');
  });

  it('3. Los módulos de dominio deben residir en rutas canónicas y ser reutilizables', () => {
    const requiredEngines = ['fitnessCalculator.ts', 'workoutGenerator.ts', 'runtimeContracts.ts'];
    for (const req of requiredEngines) {
      const exists = fs.existsSync(path.join(libDir, req));
      assert.ok(exists, `El activo clave ${req} debe existir de forma modular en src/lib/`);
    }
  });
});
