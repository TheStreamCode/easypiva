import { LIMITS } from '../fiscal-data';
import { getAtecoCoefficient } from '../fiscal-data';
import { parseNonNegativeNumber } from '../number-input';
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
  const nettoAnnuo = parseNonNegativeNumber(input.nettoMensile) * 12;

  if (nettoAnnuo === 0) {
    return {
      nettoAnnuo,
      ricaviNecessari: 0,
      inpsStimato: 0,
      tasseStimate: 0,
      costiForfettari: 0,
      available: true,
      warnings: [],
    };
  }

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

  let low = Math.max(0, nettoAnnuo);
  let high = Math.max(nettoAnnuo, 1);

  while (
    calculateNetForRevenue(high, coefficiente, aliquotaImposta, input.tipoInps, input.riduzioneInps)
      .netto < nettoAnnuo
  ) {
    high *= 2;
  }

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
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

  const ricaviNecessari = high;
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
