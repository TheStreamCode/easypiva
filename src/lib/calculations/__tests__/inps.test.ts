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

    expect(result.fisso).toBeCloseTo(4521.36);
    expect(result.variabile).toBe(0);
    expect(result.totale).toBeCloseTo(4521.36);
  });

  it('calculates Commercianti contributions above the minimale with reduction', () => {
    const result = calculateInps(20000, 'commercianti', true);

    expect(result.fisso).toBeCloseTo(2997.566);
    expect(result.variabile).toBeCloseTo(189.67104);
    expect(result.totale).toBeCloseTo(3187.23704, 4);
  });

  it('applies the +1% surcharge on income above the threshold (56.224 €)', () => {
    const result = calculateInps(70000, 'artigiani');

    // fisso 4521.36 + base band (56224-18808)*24% + surcharge band (70000-56224)*25%
    expect(result.fisso).toBeCloseTo(4521.36);
    expect(result.variabile).toBeCloseTo(12423.84, 2);
    expect(result.totale).toBeCloseTo(16945.2, 2);
  });

  it('defaults to the post-1995 massimale (122.295 €)', () => {
    const result = calculateInps(130000, 'commercianti');

    // income capped at 122295: base band 24,48% + surcharge band 25,48%
    expect(result.variabile).toBeCloseTo(25994.3276, 2);
    expect(result.totale).toBeCloseTo(30605.9676, 2);
  });

  it('uses the lower massimale for contribution seniority at 31 December 1995', () => {
    const result = calculateInps(130000, 'commercianti', false, 'pre1996');

    // income capped at 93,707: base band 24.48% + surcharge band 25.48%
    expect(result.variabile).toBeCloseTo(18710.1052, 2);
    expect(result.totale).toBeCloseTo(23321.7452, 2);
  });

  it('caps Gestione Separata at the massimale', () => {
    const result = calculateInps(150000, 'gestioneSeparata');

    expect(result.totale).toBeCloseTo(122295 * 0.2607, 2);
  });

  it('clamps negative incomes to zero', () => {
    const result = calculateInps(-1000, 'gestioneSeparata');

    expect(result.fisso).toBe(0);
    expect(result.variabile).toBe(0);
    expect(result.totale).toBe(0);
  });
});
