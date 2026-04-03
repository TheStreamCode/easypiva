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
    expect(result.ordinario.inps).toBeCloseTo(6244.836, 3);
  });
});
