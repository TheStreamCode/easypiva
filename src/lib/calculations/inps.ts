import {
  CURRENT_PROFILE,
  type ContributionHistory,
  type FiscalProfile,
  type InpsType,
} from '../fiscal';
import type { InpsCalculation } from './types';

export function calculateInps(
  redditoLordo: number,
  tipoInps: InpsType,
  riduzioneInps = false,
  contributionHistory: ContributionHistory = 'post1995',
  mesiAttivita = 12,
  profile: FiscalProfile = CURRENT_PROFILE,
): InpsCalculation {
  const imponibile = Math.max(0, redditoLordo);
  const rates = profile.constants.inpsRates;

  if (tipoInps === 'nessuno') {
    return { fisso: 0, variabile: 0, totale: 0 };
  }

  if (tipoInps === 'gestioneSeparata') {
    const base = Math.min(imponibile, rates.gestioneSeparata.massimale);
    const totale = base * rates.gestioneSeparata.rate;

    return { fisso: 0, variabile: totale, totale };
  }

  const tipoRates = rates[tipoInps];
  const massimale =
    contributionHistory === 'pre1996' ? tipoRates.massimalePre1996 : tipoRates.massimalePost1995;
  const mesi = Number.isFinite(mesiAttivita) ? Math.min(12, Math.max(1, mesiAttivita)) : 12;
  const riduzione = riduzioneInps ? 1 - profile.constants.inpsRiduzioneForfettari : 1;
  // The fixed contribution accrues month by month: INPS Circular 14/2026 lists
  // the monthly amounts (376,78 / 384,31 EUR) for partial activity periods.
  const fisso = ((tipoRates.minimalContribution * mesi) / 12) * riduzione;

  // Il contributo variabile si calcola sull'eccedenza oltre il minimale, fino al massimale.
  // Oltre la soglia surchargeThreshold l'aliquota IVS aumenta di surchargeRate (+1%).
  const cappedIncome = Math.min(imponibile, massimale);
  let variabile = 0;
  if (cappedIncome > tipoRates.minimalIncome) {
    const baseBand = Math.min(cappedIncome, tipoRates.surchargeThreshold) - tipoRates.minimalIncome;
    variabile += Math.max(0, baseBand) * tipoRates.rateOverMinimal * riduzione;

    if (cappedIncome > tipoRates.surchargeThreshold) {
      const surchargeBand = cappedIncome - tipoRates.surchargeThreshold;
      variabile +=
        surchargeBand * (tipoRates.rateOverMinimal + tipoRates.surchargeRate) * riduzione;
    }
  }

  return {
    fisso,
    variabile,
    totale: fisso + variabile,
  };
}
