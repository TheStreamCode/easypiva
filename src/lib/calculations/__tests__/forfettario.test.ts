import { describe, expect, it } from 'vitest';
import { calculateForfettario } from '../forfettario';
import type { WarningCode } from '../types';

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

  it('subtracts deductible contributions from the final net result', () => {
    const result = calculateForfettario({
      ricavi: 50000,
      atecoId: '8',
      contributiVersati: 1000,
      mesiAttivita: 12,
      nuovaAttivita: true,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.redditoNettoImponibile).toBeCloseTo(38000);
    expect(result.impostaSostitutiva).toBeCloseTo(1900);
    expect(result.nettoStimato).toBeCloseTo(47100);
  });

  it('uses estimated INPS contributions when no override is provided', () => {
    const result = calculateForfettario({
      ricavi: 50000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.contributiConsiderati).toBeCloseTo(10167.3, 2);
    expect(result.redditoNettoImponibile).toBeCloseTo(28832.7, 2);
    expect(result.impostaSostitutiva).toBeCloseTo(4324.905, 3);
    expect(result.nettoStimato).toBeCloseTo(35507.795, 3);
  });

  it('uses manual contributions as an override when provided', () => {
    const result = calculateForfettario({
      ricavi: 50000,
      atecoId: '8',
      contributiVersati: 8000,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'gestioneSeparata',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.inps.totale).toBeCloseTo(10167.3, 2);
    expect(result.contributiConsiderati).toBe(8000);
    expect(result.redditoNettoImponibile).toBe(31000);
    expect(result.impostaSostitutiva).toBe(4650);
    expect(result.nettoStimato).toBe(37350);
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

    const warningCodes: WarningCode[] = result.warnings.map((warning) => warning.code);

    expect(result.warnings).toEqual([
      expect.objectContaining({ code: 'revenue-over-85000', severity: 'warning' }),
    ]);
    expect(warningCodes).toEqual(['revenue-over-85000']);
  });

  it('does not trigger immediate exit for annualized revenues below the actual threshold', () => {
    const result = calculateForfettario({
      ricavi: 60000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 6,
      nuovaAttivita: false,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.warnings.map((warning) => warning.code)).not.toContain('revenue-over-100000');
    expect(result.warnings).toContainEqual({
      code: 'revenue-over-85000',
      severity: 'warning',
    });
  });

  it('marks results as unavailable when actual revenues exceed 100000 euro', () => {
    const result = calculateForfettario({
      ricavi: 100001,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.available).toBe(false);
  });

  it('uses the default ATECO coefficient when the id is invalid', () => {
    const result = calculateForfettario({
      ricavi: 1000,
      atecoId: 'invalid',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.coefficiente).toBeCloseTo(0.78);
  });

  it('returns structured warning objects', () => {
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

    expect(result.warnings[0]).toEqual(
      expect.objectContaining({
        code: 'revenue-over-85000',
        severity: 'warning',
      }),
    );
  });

  // Art. 233, comma 1, lett. f, TUIR 2026 (D.Lgs. 117/2026): redditi di lavoro
  // dipendente e assimilati dell'anno precedente eccedenti 30.000 euro.
  it('uses the 30.000 euro employment income limit', () => {
    const base = {
      ricavi: 50000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'nessuno' as const,
      riduzioneInps: false,
      speseDipendenti: 0,
    };

    const belowLimit = calculateForfettario({ ...base, redditoDipendente: 29999 });
    const atLimit = calculateForfettario({ ...base, redditoDipendente: 30000 });
    const overLimit = calculateForfettario({ ...base, redditoDipendente: 30001 });

    expect(belowLimit.warnings).toEqual([]);
    expect(atLimit.warnings).toEqual([]);
    expect(overLimit.available).toBe(false);
    expect(overLimit.warnings).toEqual([
      expect.objectContaining({ code: 'employment-income-over-limit', severity: 'critical' }),
    ]);
  });

  it('marks the regime unavailable when employee costs exceed the limit', () => {
    const result = calculateForfettario({
      ricavi: 50000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: false,
      tipoInps: 'nessuno',
      riduzioneInps: false,
      speseDipendenti: 20001,
      redditoDipendente: 0,
    });

    expect(result.available).toBe(false);
    expect(result.warnings).toContainEqual({
      code: 'employee-costs-over-limit',
      severity: 'critical',
    });
  });

  it('prorates the fixed INPS contribution with the activity months', () => {
    const result = calculateForfettario({
      ricavi: 30000,
      atecoId: '8',
      contributiVersati: 0,
      mesiAttivita: 6,
      nuovaAttivita: true,
      tipoInps: 'artigiani',
      riduzioneInps: false,
      speseDipendenti: 0,
      redditoDipendente: 0,
    });

    expect(result.inps.fisso).toBeCloseTo(2260.68, 2);
  });
});
