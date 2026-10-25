import { CURRENT_PROFILE, type FiscalProfile } from '../fiscal';
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

export function buildPlanningProjection(
  ricaviMensili: number[],
  profile: FiscalProfile = CURRENT_PROFILE,
): PlanningResult {
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

  const { limits } = profile.constants;
  const totaleAnnuo = cumulato;
  const limiteSuperato = totaleAnnuo > limits.ricavi;
  const uscitaImmediata = totaleAnnuo > limits.uscitaImmediata;
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
