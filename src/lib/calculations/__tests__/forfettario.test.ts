import { describe, expect, it } from 'vitest';
import { calculateForfettario } from '../forfettario';

describe('calculateForfettario', () => {
  it('applies the 5% substitute tax for new activities', () => {
    const result = calculateForfettario({
      ricavi: 50000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: true,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.aliquotaImposta).toBe(0.05);
    expect(result.redditoLordo).toBeCloseTo(39000);
    expect(result.impostaSostitutiva).toBeCloseTo(1950);
    expect(result.nettoStimato).toBeCloseTo(48050);
  });

  it('applies the 15% substitute tax for standard activities', () => {
    const result = calculateForfettario({
      ricavi: 50000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.aliquotaImposta).toBe(0.15);
    expect(result.impostaSostitutiva).toBeCloseTo(5850);
    expect(result.nettoStimato).toBeCloseTo(44150);
  });

  it('returns threshold warnings for annualized revenues', () => {
    const result = calculateForfettario({
      ricavi: 90000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.warnings).toContain(
      'Attenzione: I ricavi ragguagliati superano 85.000€. Uscirai dal regime forfettario l\'anno prossimo.'
    );
  });
});
