import { INPS_RATES, type ContributionHistory, type InpsType } from '../fiscal-data';
import type { InpsCalculation } from './types';

export function calculateInps(
  redditoLordo: number,
  tipoInps: InpsType,
  riduzioneInps = false,
  contributionHistory: ContributionHistory = 'post1995',
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
  const riduzione = riduzioneInps ? 0.65 : 1;
  const fisso = rates.minimalContribution * riduzione;

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
