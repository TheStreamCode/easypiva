import { CURRENT_PROFILE, getAtecoCoefficient, type FiscalProfile } from '../fiscal';
import { parseNonNegativeNumber } from '../number-input';
import { calculateInps } from './inps';
import type { TargetNetInput, TargetNetResult, WarningCode } from './types';

function calculateNetForRevenue(
  ricavi: number,
  coefficiente: number,
  aliquotaImposta: number,
  tipoInps: TargetNetInput['tipoInps'],
  riduzioneInps: boolean,
  contributionHistory: TargetNetInput['contributionHistory'],
  profile: FiscalProfile,
) {
  const redditoLordo = ricavi * coefficiente;
  const inps = calculateInps(
    redditoLordo,
    tipoInps,
    riduzioneInps,
    contributionHistory,
    12,
    profile,
  );
  const tasse = Math.max(0, redditoLordo - inps.totale) * aliquotaImposta;

  return {
    redditoLordo,
    inps: inps.totale,
    tasse,
    netto: ricavi - tasse - inps.totale,
  };
}

function buildTargetAvailability(ricaviNecessari: number, profile: FiscalProfile) {
  const { limits } = profile.constants;

  if (ricaviNecessari > limits.uscitaImmediata) {
    return {
      available: false,
      warnings: ['revenue-over-100000'] as WarningCode[],
    };
  }

  if (ricaviNecessari > limits.ricavi) {
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

export function calculateTargetNet(
  input: TargetNetInput,
  profile: FiscalProfile = CURRENT_PROFILE,
): TargetNetResult {
  const { sostitutiva } = profile.constants;
  const coefficiente = getAtecoCoefficient(input.atecoId, profile) / 100;
  const aliquotaImposta = input.nuovaAttivita ? sostitutiva.startup : sostitutiva.standard;
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
      input.contributionHistory,
      profile,
    );

    return {
      nettoAnnuo,
      ricaviNecessari,
      inpsStimato: detail.inps,
      tasseStimate: detail.tasse,
      costiForfettari: ricaviNecessari - detail.redditoLordo,
      ...buildTargetAvailability(ricaviNecessari, profile),
    };
  }

  let low = Math.max(0, nettoAnnuo);
  let high = Math.max(nettoAnnuo, 1);

  while (
    calculateNetForRevenue(
      high,
      coefficiente,
      aliquotaImposta,
      input.tipoInps,
      input.riduzioneInps,
      input.contributionHistory,
      profile,
    ).netto < nettoAnnuo
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
      input.contributionHistory,
      profile,
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
    input.contributionHistory,
    profile,
  );

  return {
    nettoAnnuo,
    ricaviNecessari,
    inpsStimato: detail.inps,
    tasseStimate: detail.tasse,
    costiForfettari: ricaviNecessari - detail.redditoLordo,
    ...buildTargetAvailability(ricaviNecessari, profile),
  };
}
