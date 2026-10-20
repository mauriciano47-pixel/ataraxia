/**
 * ATARAXIA — Guardián de Contratos en Tiempo de Ejecución (Zero-Trust Runtime I/O)
 * Valida y sanitiza esquemas de entrada/salida (IA, Telemetría, Perfil y Almacenamiento)
 * en tiempo de ejecución para impedir propagación de tipos corruptos, NaN o payloads malformados.
 */

export interface ContractValidationResult<T> {
  valid: boolean;
  data: T;
  errors: string[];
}

export function clampFiniteNumber(val: unknown, fallback: number, min: number, max: number): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function sanitizeStringField(val: unknown, fallback: string, maxLength = 500): string {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}

export interface StoicPromptContract {
  prompt: string;
  userName: string;
  weightKg: number;
}

export function validateContract<T>(
  raw: unknown,
  validator: (input: unknown) => ContractValidationResult<T>
): ContractValidationResult<T> {
  try {
    return validator(raw);
  } catch (err) {
    return {
      valid: false,
      data: {} as T,
      errors: [err instanceof Error ? err.message : 'Unknown runtime contract error'],
    };
  }
}

export function sanitizeAndValidateStoicInput(rawInput: unknown): ContractValidationResult<StoicPromptContract> {
  const raw = (typeof rawInput === 'object' && rawInput !== null ? rawInput : {}) as {
    prompt?: unknown;
    userName?: unknown;
    weightKg?: unknown;
  };
  const errors: string[] = [];
  if (typeof raw?.prompt !== 'string' || raw.prompt.trim().length === 0) {
    errors.push('Prompt vacío o inválido');
  }
  const prompt = sanitizeStringField(raw?.prompt, 'consulta estoica', 1200);
  const rawName = sanitizeStringField(raw?.userName, 'Guerrero', 80);
  const userName = rawName === 'Ciudadano Prokopton' ? 'Guerrero' : rawName;
  const weightKg = clampFiniteNumber(raw?.weightKg, 75, 30, 250);

  return {
    valid: errors.length === 0,
    data: { prompt, userName, weightKg },
    errors,
  };
}
