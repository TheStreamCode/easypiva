import { LIMITS } from '../fiscal-data';
import type { PlanningResult } from './types';

const mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

export function buildPlanningProjection(ricaviMensili: number[]): PlanningResult {
  let cumulato = 0;
  const projection = mesi.map((mese, index) => {
    cumulato += ricaviMensili[index] ?? 0;

    return {
      month: mese,
      revenue: ricaviMensili[index] ?? 0,
      cumulativeRevenue: cumulato,
    };
  });

  const totaleAnnuo = cumulato;
  const limiteSuperato = totaleAnnuo > LIMITS.ricavi;
  const uscitaImmediata = totaleAnnuo > LIMITS.uscitaImmediata;
  const warnings = [] as PlanningResult['warnings'];

  if (limiteSuperato && !uscitaImmediata) {
    warnings.push({
      code: 'revenue-over-85000',
      severity: 'warning',
      message: "Hai superato la soglia degli 85.000€. L'anno prossimo uscirai dal regime forfettario e passerai al regime ordinario, ma per l'anno in corso mantieni i benefici fiscali.",
    });
  }

  if (uscitaImmediata) {
    warnings.push({
      code: 'revenue-over-100000',
      severity: 'critical',
      message: "Hai superato la soglia dei 100.000€. Esci IMMEDIATAMENTE dal regime forfettario nell'anno in corso. Dovrai applicare l'IVA sulle fatture successive all'incasso che ha causato il superamento.",
    });
  }

  return {
    projection,
    totaleAnnuo,
    limiteSuperato,
    uscitaImmediata,
    warnings,
  };
}
