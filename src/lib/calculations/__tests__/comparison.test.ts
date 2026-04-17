import { describe, expect, it } from 'vitest';
import { compareRegimes } from '../comparison';

describe('compareRegimes', () => {
  it('selects the regime with the higher net result', () => {
    const result = compareRegimes({
      ricavi: 50000,
      costiReali: 10000,
      atecoId: '8',
      nuovaAttivita: false,
    });

    expect(result.winner).toBe('forfettario');
    expect(result.deltaNetto).toBeGreaterThan(0);
    expect(result.forfettario.netto).toBeGreaterThan(result.ordinario.netto);
  });

  it('uses the configured INPS type for both regimes', () => {
    const result = compareRegimes({
      ricavi: 50000,
      costiReali: 10000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'artigiani',
      riduzioneInps: true,
    });

    expect(result.forfettario.inps).toBeCloseTo(6088.836, 3);
    expect(result.ordinario.inps).toBeCloseTo(9607.44, 2);
  });

  it('marks the forfettario as unavailable above the immediate exit threshold', () => {
    const result = compareRegimes({
      ricavi: 100001,
      costiReali: 10000,
      atecoId: '8',
      nuovaAttivita: false,
    });

    expect(result.forfettario.available).toBe(false);
    expect(result.winner).toBe('ordinario');
  });

  it('calculates forfettario tax after deducting the selected INPS estimate', () => {
    const result = compareRegimes({
      ricavi: 50000,
      costiReali: 10000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
    });

    expect(result.forfettario.inps).toBeCloseTo(10167.3, 2);
    expect(result.forfettario.tasse).toBeCloseTo(4324.905, 3);
    expect(result.forfettario.netto).toBeCloseTo(35507.795, 3);
  });
});
