import { LIMITS } from '../fiscal-data';
import { parseNonNegativeNumber } from '../number-input';
import type { PlanningResult } from './types';

export const mesi = [
  'Gen',
  'Feb',
  'Mar',
  'Apr',
  'Mag',
  'Giu',
  'Lug',
  'Ago',
  'Set',
  'Ott',
  'Nov',
  'Dic',
];

export function buildPlanningProjection(ricaviMensili: number[]): PlanningResult {
  let cumulato = 0;
  const projection = mesi.map((mese, index) => {
    const revenue = parseNonNegativeNumber(ricaviMensili[index]);
    cumulato += revenue;

    return {
      month: mese,
      revenue,
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
    });
  }

  if (uscitaImmediata) {
    warnings.push({
      code: 'revenue-over-100000',
      severity: 'critical',
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
