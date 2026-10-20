import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampFiniteNumber,
  sanitizeStringField,
  validateContract,
  sanitizeAndValidateStoicInput,
} from '../src/lib/runtimeContracts.ts';

describe('Runtime Contracts & Zero-Trust I/O Guards', () => {
  it('clampFiniteNumber neutralizes NaN, Infinity, and out-of-bounds numbers', () => {
    assert.equal(clampFiniteNumber(Number.NaN, 75, 30, 250), 75);
    assert.equal(clampFiniteNumber(Number.POSITIVE_INFINITY, 75, 30, 250), 75);
    assert.equal(clampFiniteNumber(10, 75, 30, 250), 30);
    assert.equal(clampFiniteNumber(999, 75, 30, 250), 250);
    assert.equal(clampFiniteNumber(82, 75, 30, 250), 82);
  });

  it('sanitizeStringField trims, falls back on empty/non-string, and truncates safely', () => {
    assert.equal(sanitizeStringField('  Espartano  ', 'Fallback'), 'Espartano');
    assert.equal(sanitizeStringField('   ', 'Fallback'), 'Fallback');
    assert.equal(sanitizeStringField(null, 'Fallback'), 'Fallback');
    assert.equal(sanitizeStringField('ABCDEFG', 'Fallback', 4), 'ABCD');
  });

  it('sanitizeAndValidateStoicInput normalizes Stoic Mentor inputs and catches empty prompts', () => {
    const validRes = validateContract(
      { prompt: '  Dolor de hombro ', userName: 'Ciudadano Prokopton', weightKg: 85 },
      sanitizeAndValidateStoicInput
    );
    assert.equal(validRes.valid, true);
    assert.equal(validRes.data.prompt, 'Dolor de hombro');
    assert.equal(validRes.data.userName, 'Guerrero');
    assert.equal(validRes.data.weightKg, 85);

    const invalidRes = validateContract(
      { prompt: '   ', userName: 12345, weightKg: Number.NaN },
      sanitizeAndValidateStoicInput
    );
    assert.equal(invalidRes.valid, false);
    assert.equal(invalidRes.data.userName, 'Guerrero');
    assert.equal(invalidRes.data.weightKg, 75);
    assert.ok(invalidRes.errors.length > 0);
  });

  it('validateContract handles thrown exceptions inside custom validators gracefully', () => {
    const res = validateContract({}, () => {
      throw new Error('Malformed payload');
    });
    assert.equal(res.valid, false);
    assert.deepEqual(res.errors, ['Malformed payload']);
  });
});
