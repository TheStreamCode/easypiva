import { describe, expect, it } from 'vitest';
import { calculateTargetNet } from '../targetNet';

describe('calculateTargetNet', () => {
  it('solves the reverse revenue calculation for Gestione Separata', () => {
    const target = calculateTargetNet({
      nettoMensile: 2000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
    });

    const coefficiente = 0.78;
    const redditoLordo = target.ricaviNecessari * coefficiente;
    const inps = redditoLordo * 0.2607;
    const tasse = (redditoLordo - inps) * 0.15;
    const netto = target.ricaviNecessari - tasse - inps;

    expect(netto).toBeCloseTo(24000, 0);
    expect(target.tasseStimate + target.inpsStimato).toBeLessThan(target.ricaviNecessari);
  });
});
