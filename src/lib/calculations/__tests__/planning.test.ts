import { describe, expect, it } from 'vitest';
import { buildPlanningProjection } from '../planning';

describe('buildPlanningProjection', () => {
  it('flags the 85k warning threshold', () => {
    const result = buildPlanningProjection(Array(12).fill(7500));

    expect(result.totaleAnnuo).toBe(90000);
    expect(result.limiteSuperato).toBe(true);
    expect(result.uscitaImmediata).toBe(false);
    expect(result.warnings).toContain(
      'Attenzione: Hai superato la soglia degli 85.000€. L\'anno prossimo uscirai dal regime forfettario e passerai al regime ordinario, ma per l\'anno in corso mantieni i benefici fiscali.'
    );
  });

  it('flags the 100k immediate exit threshold', () => {
    const result = buildPlanningProjection(Array(12).fill(9000));

    expect(result.totaleAnnuo).toBe(108000);
    expect(result.uscitaImmediata).toBe(true);
    expect(result.warnings).toContain(
      'CRITICO: Hai superato la soglia dei 100.000€. Esci IMMEDIATAMENTE dal regime forfettario nell\'anno in corso. Dovrai applicare l\'IVA sulle fatture successive all\'incasso che ha causato il superamento.'
    );
  });
});
