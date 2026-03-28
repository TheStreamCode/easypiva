import { INPS_RATES, type InpsType } from '../fiscal-data';
import type { InpsCalculation } from './types';

export function calculateInps(redditoLordo: number, tipoInps: InpsType, riduzioneInps = false): InpsCalculation {
  if (tipoInps === 'nessuno') {
    return { fisso: 0, variabile: 0, totale: 0 };
  }

  if (tipoInps === 'gestioneSeparata') {
    const totale = redditoLordo * INPS_RATES.gestioneSeparata.rate;

    return { fisso: 0, variabile: totale, totale };
  }

  const rates = INPS_RATES[tipoInps];
  const riduzione = riduzioneInps ? 0.65 : 1;
  const fisso = rates.minimalContribution * riduzione;
  const variabile = redditoLordo > rates.minimalIncome ? (redditoLordo - rates.minimalIncome) * rates.rateOverMinimal * riduzione : 0;

  return {
    fisso,
    variabile,
    totale: fisso + variabile,
  };
}
