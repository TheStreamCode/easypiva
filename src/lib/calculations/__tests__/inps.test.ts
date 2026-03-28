import { describe, expect, it } from 'vitest';
import { calculateInps } from '../inps';

describe('calculateInps', () => {
  it('calculates Gestione Separata contributions', () => {
    const result = calculateInps(50000, 'gestioneSeparata');

    expect(result.totale).toBeCloseTo(13035);
    expect(result.fisso).toBe(0);
    expect(result.variabile).toBeCloseTo(13035);
  });

  it('calculates Artigiani contributions below the minimale', () => {
    const result = calculateInps(18000, 'artigiani');

    expect(result.fisso).toBeCloseTo(4427.04);
    expect(result.variabile).toBe(0);
    expect(result.totale).toBeCloseTo(4427.04);
  });

  it('calculates Commercianti contributions above the minimale with reduction', () => {
    const result = calculateInps(20000, 'commercianti', true);

    expect(result.fisso).toBeCloseTo(2935.0295);
    expect(result.variabile).toBeCloseTo(252.2052);
    expect(result.totale).toBeCloseTo(3187.2347, 4);
  });
});
