import { describe, expect, it } from 'vitest';
import { calculateForfettario } from '../forfettario';
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

  it('handles nessuno without crashing', () => {
    const target = calculateTargetNet({
      nettoMensile: 2000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'nessuno',
      riduzioneInps: false,
    });

    expect(target.ricaviNecessari).toBeGreaterThan(0);
    expect(target.inpsStimato).toBe(0);
    expect(target.tasseStimate).toBeCloseTo(target.ricaviNecessari * 0.78 * 0.15, 6);
  });

  it('solves the reverse revenue calculation for Artigiani with reduction', () => {
    const target = calculateTargetNet({
      nettoMensile: 2000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'artigiani',
      riduzioneInps: true,
    });

    expect(target.ricaviNecessari).toBeGreaterThan(24000);
    expect(target.inpsStimato).toBeGreaterThan(0);
    expect(target.tasseStimate + target.inpsStimato).toBeLessThan(target.ricaviNecessari);
  });

  it('solves the reverse revenue calculation for Commercianti', () => {
    const target = calculateTargetNet({
      nettoMensile: 3000,
      atecoId: '2',
      nuovaAttivita: false,
      tipoInps: 'commercianti',
      riduzioneInps: false,
    });

    expect(target.ricaviNecessari).toBeGreaterThan(36000);
    expect(target.inpsStimato).toBeGreaterThan(0);
    expect(target.tasseStimate + target.inpsStimato).toBeLessThan(target.ricaviNecessari);
  });

  it('flags targets that exceed the forfettario thresholds', () => {
    const target = calculateTargetNet({
      nettoMensile: 10000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
    });

    expect(target.available).toBe(false);
    expect(target.warnings).toContain('revenue-over-100000');
  });

  it('stays consistent with the direct forfettario calculation', () => {
    const target = calculateTargetNet({
      nettoMensile: 2000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
    });

    const forfettario = calculateForfettario({
      ricavi: target.ricaviNecessari,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(forfettario.nettoStimato).toBeCloseTo(target.nettoAnnuo, 0);
    expect(forfettario.impostaSostitutiva).toBeCloseTo(target.tasseStimate, 3);
  });

  it('clamps negative net targets to zero', () => {
    const target = calculateTargetNet({
      nettoMensile: -2000,
      atecoId: '8',
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
    });

    expect(target.nettoAnnuo).toBe(0);
    expect(target.ricaviNecessari).toBe(0);
    expect(target.inpsStimato).toBe(0);
    expect(target.tasseStimate).toBe(0);
  });
});
