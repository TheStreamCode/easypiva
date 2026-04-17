import { LIMITS } from '../fiscal-data';
import { getAtecoCoefficient, INPS_RATES } from '../fiscal-data';
import { calculateInps } from './inps';
import type { TargetNetInput, TargetNetResult, WarningCode } from './types';

function calculateNetForRevenue(
  ricavi: number,
  coefficiente: number,
  aliquotaImposta: number,
  tipoInps: TargetNetInput['tipoInps'],
  riduzioneInps: boolean,
) {
  const redditoLordo = ricavi * coefficiente;
  const inps = calculateInps(redditoLordo, tipoInps, riduzioneInps);
  const tasse = Math.max(0, redditoLordo - inps.totale) * aliquotaImposta;

  return {
    redditoLordo,
    inps: inps.totale,
    tasse,
    netto: ricavi - tasse - inps.totale,
  };
}

function buildTargetAvailability(ricaviNecessari: number) {
  if (ricaviNecessari > LIMITS.uscitaImmediata) {
    return {
      available: false,
      warnings: ['revenue-over-100000'] as WarningCode[],
    };
  }

  if (ricaviNecessari > LIMITS.ricavi) {
    return {
      available: true,
      warnings: ['revenue-over-85000'] as WarningCode[],
    };
  }

  return {
    available: true,
    warnings: [] as WarningCode[],
  };
}

export function calculateTargetNet(input: TargetNetInput): TargetNetResult {
  const coefficiente = getAtecoCoefficient(input.atecoId) / 100;
  const aliquotaImposta = input.nuovaAttivita ? 0.05 : 0.15;
  const nettoAnnuo = input.nettoMensile * 12;

  if (input.tipoInps === 'nessuno') {
    const denom = 1 - coefficiente * aliquotaImposta;
    const ricaviNecessari = nettoAnnuo / denom;
    const detail = calculateNetForRevenue(
      ricaviNecessari,
      coefficiente,
      aliquotaImposta,
      input.tipoInps,
      input.riduzioneInps,
    );

    return {
      nettoAnnuo,
      ricaviNecessari,
      inpsStimato: detail.inps,
      tasseStimate: detail.tasse,
      costiForfettari: ricaviNecessari - detail.redditoLordo,
      ...buildTargetAvailability(ricaviNecessari),
    };
  }

  if (input.tipoInps === 'gestioneSeparata') {
    const aliquotaInps = INPS_RATES.gestioneSeparata.rate;
    const denom =
      1 - coefficiente * aliquotaInps - coefficiente * (1 - aliquotaInps) * aliquotaImposta;
    const ricaviNecessari = nettoAnnuo / denom;
    const detail = calculateNetForRevenue(
      ricaviNecessari,
      coefficiente,
      aliquotaImposta,
      input.tipoInps,
      input.riduzioneInps,
    );

    return {
      nettoAnnuo,
      ricaviNecessari,
      inpsStimato: detail.inps,
      tasseStimate: detail.tasse,
      costiForfettari: ricaviNecessari - detail.redditoLordo,
      ...buildTargetAvailability(ricaviNecessari),
    };
  }

  const rates = INPS_RATES[input.tipoInps];
  const riduzione = input.riduzioneInps ? 0.65 : 1;

  let low = Math.max(0, nettoAnnuo);
  let high = Math.max(nettoAnnuo, 1);
  let mid = 0;

  while (
    calculateNetForRevenue(high, coefficiente, aliquotaImposta, input.tipoInps, input.riduzioneInps)
      .netto < nettoAnnuo
  ) {
    high *= 2;
  }

  for (let i = 0; i < 50; i++) {
    mid = (low + high) / 2;
    const detail = calculateNetForRevenue(
      mid,
      coefficiente,
      aliquotaImposta,
      input.tipoInps,
      input.riduzioneInps,
    );

    if (detail.netto < nettoAnnuo) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const ricaviNecessari = mid;
  const redditoLordo = ricaviNecessari * coefficiente;
  const inpsStimato =
    rates.minimalContribution * riduzione +
    (redditoLordo > rates.minimalIncome
      ? (redditoLordo - rates.minimalIncome) * rates.rateOverMinimal * riduzione
      : 0);
  const tasseStimate = Math.max(0, redditoLordo - inpsStimato) * aliquotaImposta;

  return {
    nettoAnnuo,
    ricaviNecessari,
    inpsStimato,
    tasseStimate,
    costiForfettari: ricaviNecessari - redditoLordo,
    ...buildTargetAvailability(ricaviNecessari),
  };
}
