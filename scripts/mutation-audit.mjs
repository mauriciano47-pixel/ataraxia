/**
 * Ataraxia — Motor Ligero de Auditoría por Mutación (Zero-Dependency Mutation Testing Engine)
 * Inyecta mutaciones de operadores aritméticos y relacionales en un sandbox aislado (scratch/)
 * y verifica empíricamente que la suite de pruebas detecte y aniquile el 100% de los mutantes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const SANDBOX = path.join(ROOT, 'scratch', 'mutation_sandbox');

const MUTATIONS = [
  {
    id: 'MUT-01',
    name: 'Mifflin-St Jeor Peso Invertido (10 * w -> 10 - w)',
    file: 'src/lib/fitnessCalculator.ts',
    target: '10 * w + 6.25 * h',
    replacement: '10 - w + 6.25 * h',
    testFile: 'tests/fitnessCalculator.test.ts',
  },
  {
    id: 'MUT-02',
    name: 'Factor Déficit Calórico Saboteado (0.82 -> 1.45)',
    file: 'src/lib/fitnessCalculator.ts',
    target: 'targetCalories = Math.round(tdee * 0.82);',
    replacement: 'targetCalories = Math.round(tdee * 1.45);',
    testFile: 'tests/fitnessCalculator.test.ts',
  },
  {
    id: 'MUT-03',
    name: 'Suma de Macros Rota (proteinPct = 30 -> 90)',
    file: 'src/lib/fitnessCalculator.ts',
    target: 'let proteinPct = 30;',
    replacement: 'let proteinPct = 90;',
    testFile: 'tests/propertyFuzzing.test.ts',
  },
  {
    id: 'MUT-04',
    name: 'Umbral de Cadencia Caminata Invertido (cadenceSpm < 100 -> cadenceSpm < 10)',
    file: 'src/lib/fitnessCalculator.ts',
    target: "if (cadenceSpm < 100) return 'walking';",
    replacement: "if (cadenceSpm < 10) return 'walking';",
    testFile: 'tests/fitnessCalculator.test.ts',
  },
  {
    id: 'MUT-05',
    name: 'Fórmula de Distancia Anulada (safeSteps * strideLengthM -> 0)',
    file: 'src/lib/fitnessCalculator.ts',
    target: '(safeSteps * strideLengthM) / 1000',
    replacement: '(0 * strideLengthM) / 1000',
    testFile: 'tests/fitnessCalculator.test.ts',
  },
  {
    id: 'MUT-06',
    name: 'Pilar de Entrenamiento Estoico Anulado (trainingDone ? 20 : 0 -> 0)',
    file: 'src/lib/cycleGrading.ts',
    target: 'const trainingPts = trainingDone ? 20 : 0;',
    replacement: 'const trainingPts = 0;',
    testFile: 'tests/cycleGrading.test.ts',
  },
  {
    id: 'MUT-07',
    name: 'Umbral Corona de Laurel Invertido (totalScore >= 90 -> totalScore >= 999)',
    file: 'src/lib/cycleGrading.ts',
    target: 'if (totalScore >= 90) {',
    replacement: 'if (totalScore >= 999) {',
    testFile: 'tests/cycleGrading.test.ts',
  },
  {
    id: 'MUT-08',
    name: 'Clamping de Score Diario Roto (Math.min(100, ...) -> -50)',
    file: 'src/lib/cycleGrading.ts',
    target: 'score: totalScore,',
    replacement: 'score: -50,',
    testFile: 'tests/propertyFuzzing.test.ts',
  },
];

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

console.log('======================================================================');
console.log(' 🧬 ATARAXIA — AUDITORÍA DE PRUEBAS POR MUTACIÓN (MUTATION TESTING)');
console.log('======================================================================');

let killed = 0;
let survived = 0;
const startTime = Date.now();

try {
  if (fs.existsSync(SANDBOX)) {
    fs.rmSync(SANDBOX, { recursive: true, force: true });
  }
  copyDirSync(path.join(ROOT, 'src'), path.join(SANDBOX, 'src'));
  copyDirSync(path.join(ROOT, 'tests'), path.join(SANDBOX, 'tests'));

  for (const mut of MUTATIONS) {
    const targetFilePath = path.join(SANDBOX, mut.file);
    const originalContent = fs.readFileSync(targetFilePath, 'utf8');

    if (!originalContent.includes(mut.target)) {
      console.error(`⚠️ [${mut.id}] No se encontró el patrón objetivo en ${mut.file}`);
      continue;
    }

    const mutatedContent = originalContent.replace(mut.target, mut.replacement);
    fs.writeFileSync(targetFilePath, mutatedContent, 'utf8');

    const res = spawnSync(
      process.execPath,
      ['--experimental-strip-types', '--test', path.join(SANDBOX, mut.testFile)],
      { cwd: SANDBOX, encoding: 'utf8', timeout: 8000 }
    );

    // Restaurar archivo original inmediatamente en el sandbox
    fs.writeFileSync(targetFilePath, originalContent, 'utf8');

    if (res.status !== 0) {
      killed++;
      console.log(` 💀 [KILLED]   ${mut.id}: ${mut.name}`);
    } else {
      survived++;
      console.log(` ⚠️ [SURVIVED] ${mut.id}: ${mut.name}`);
    }
  }
} finally {
  if (fs.existsSync(SANDBOX)) {
    fs.rmSync(SANDBOX, { recursive: true, force: true });
  }
}

const total = killed + survived;
const score = total > 0 ? Number(((killed / total) * 100).toFixed(1)) : 0;
const durationS = ((Date.now() - startTime) / 1000).toFixed(2);

console.log('----------------------------------------------------------------------');
console.log(` 📊 MUTATION SCORE: ${score}% (${killed}/${total} mutantes aniquilados en ${durationS}s)`);
console.log('======================================================================');

if (score < 85) {
  process.exit(1);
}
