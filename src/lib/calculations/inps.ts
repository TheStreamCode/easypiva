import { INPS_RATES, type ContributionHistory, type InpsType } from '../fiscal-data';
import type { InpsCalculation } from './types';

export function calculateInps(
  redditoLordo: number,
  tipoInps: InpsType,
  riduzioneInps = false,
  contributionHistory: ContributionHistory = 'post1995',
  mesiAttivita = 12,
): InpsCalculation {
  const imponibile = Math.max(0, redditoLordo);

  if (tipoInps === 'nessuno') {
    return { fisso: 0, variabile: 0, totale: 0 };
  }

  if (tipoInps === 'gestioneSeparata') {
    const base = Math.min(imponibile, INPS_RATES.gestioneSeparata.massimale);
    const totale = base * INPS_RATES.gestioneSeparata.rate;

    return { fisso: 0, variabile: totale, totale };
  }

  const rates = INPS_RATES[tipoInps];
  const massimale =
    contributionHistory === 'pre1996' ? rates.massimalePre1996 : rates.massimalePost1995;
  const mesi = Number.isFinite(mesiAttivita) ? Math.min(12, Math.max(1, mesiAttivita)) : 12;
  const riduzione = riduzioneInps ? 0.65 : 1;
  // The fixed contribution accrues month by month: INPS Circular 14/2026 lists
  // the monthly amounts (376,78 / 384,31 EUR) for partial activity periods.
  const fisso = ((rates.minimalContribution * mesi) / 12) * riduzione;

  // Il contributo variabile si calcola sull'eccedenza oltre il minimale, fino al massimale.
  // Oltre la soglia surchargeThreshold l'aliquota IVS aumenta di surchargeRate (+1%).
  const cappedIncome = Math.min(imponibile, massimale);
  let variabile = 0;
  if (cappedIncome > rates.minimalIncome) {
    const baseBand = Math.min(cappedIncome, rates.surchargeThreshold) - rates.minimalIncome;
    variabile += Math.max(0, baseBand) * rates.rateOverMinimal * riduzione;

    if (cappedIncome > rates.surchargeThreshold) {
      const surchargeBand = cappedIncome - rates.surchargeThreshold;
      variabile += surchargeBand * (rates.rateOverMinimal + rates.surchargeRate) * riduzione;
    }
  }

  return {
    fisso,
    variabile,
    totale: fisso + variabile,
  };
}
