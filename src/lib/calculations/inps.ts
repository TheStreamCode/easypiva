import { INPS_RATES, type InpsType } from '../fiscal-data';
import type { InpsCalculation } from './types';

export function calculateInps(
  redditoLordo: number,
  tipoInps: InpsType,
  riduzioneInps = false,
): InpsCalculation {
  const imponibile = Math.max(0, redditoLordo);

  if (tipoInps === 'nessuno') {
    return { fisso: 0, variabile: 0, totale: 0 };
  }

  if (tipoInps === 'gestioneSeparata') {
    const totale = imponibile * INPS_RATES.gestioneSeparata.rate;

    return { fisso: 0, variabile: totale, totale };
  }

  const rates = INPS_RATES[tipoInps];
  const riduzione = riduzioneInps ? 0.65 : 1;
  const fisso = rates.minimalContribution * riduzione;
  const variabile =
    imponibile > rates.minimalIncome
      ? (imponibile - rates.minimalIncome) * rates.rateOverMinimal * riduzione
      : 0;

  return {
    fisso,
    variabile,
    totale: fisso + variabile,
  };
}
