import type { FiscalProfile } from './types';

// Deterministic, checksum-friendly representation of a profile. The checksum
// field is excluded, and IRPEF brackets without an upper bound use null instead
// of Infinity so the payload is valid JSON.
export function toCanonicalProfile(profile: FiscalProfile) {
  return {
    version: profile.version,
    year: profile.year,
    status: profile.status,
    validFrom: profile.validFrom,
    validTo: profile.validTo,
    reviewedAt: profile.reviewedAt,
    sources: profile.sources.map((source) => ({
      id: source.id,
      label: source.label,
      url: source.url,
    })),
    rounding: {
      currencyDecimals: profile.rounding.currencyDecimals,
      quoteComputationDecimals: profile.rounding.quoteComputationDecimals,
    },
    constants: {
      ateco: profile.constants.ateco.map((category) => ({
        id: category.id,
        name: category.name,
        coefficient: category.coefficient,
      })),
      atecoDefaultCoefficient: profile.constants.atecoDefaultCoefficient,
      inpsRates: {
        gestioneSeparata: {
          rate: profile.constants.inpsRates.gestioneSeparata.rate,
          massimale: profile.constants.inpsRates.gestioneSeparata.massimale,
        },
        artigiani: {
          minimalIncome: profile.constants.inpsRates.artigiani.minimalIncome,
          minimalContribution: profile.constants.inpsRates.artigiani.minimalContribution,
          rateOverMinimal: profile.constants.inpsRates.artigiani.rateOverMinimal,
          surchargeThreshold: profile.constants.inpsRates.artigiani.surchargeThreshold,
          surchargeRate: profile.constants.inpsRates.artigiani.surchargeRate,
          massimalePre1996: profile.constants.inpsRates.artigiani.massimalePre1996,
          massimalePost1995: profile.constants.inpsRates.artigiani.massimalePost1995,
        },
        commercianti: {
          minimalIncome: profile.constants.inpsRates.commercianti.minimalIncome,
          minimalContribution: profile.constants.inpsRates.commercianti.minimalContribution,
          rateOverMinimal: profile.constants.inpsRates.commercianti.rateOverMinimal,
          surchargeThreshold: profile.constants.inpsRates.commercianti.surchargeThreshold,
          surchargeRate: profile.constants.inpsRates.commercianti.surchargeRate,
          massimalePre1996: profile.constants.inpsRates.commercianti.massimalePre1996,
          massimalePost1995: profile.constants.inpsRates.commercianti.massimalePost1995,
        },
      },
      inpsRiduzioneForfettari: profile.constants.inpsRiduzioneForfettari,
      addizionaliMedie: profile.constants.addizionaliMedie,
      irpefBrackets: profile.constants.irpefBrackets.map((bracket) => ({
        max: bracket.max,
        rate: bracket.rate,
      })),
      detrazioneLavoroAutonomo: {
        threshold5500: profile.constants.detrazioneLavoroAutonomo.threshold5500,
        amount1265: profile.constants.detrazioneLavoroAutonomo.amount1265,
        threshold28000: profile.constants.detrazioneLavoroAutonomo.threshold28000,
        base500: profile.constants.detrazioneLavoroAutonomo.base500,
        band765: profile.constants.detrazioneLavoroAutonomo.band765,
        bandWidth22500: profile.constants.detrazioneLavoroAutonomo.bandWidth22500,
        threshold50000: profile.constants.detrazioneLavoroAutonomo.threshold50000,
        width22000: profile.constants.detrazioneLavoroAutonomo.width22000,
        additional50: profile.constants.detrazioneLavoroAutonomo.additional50,
        additionalFrom: profile.constants.detrazioneLavoroAutonomo.additionalFrom,
        additionalTo: profile.constants.detrazioneLavoroAutonomo.additionalTo,
      },
      sostitutiva: {
        standard: profile.constants.sostitutiva.standard,
        startup: profile.constants.sostitutiva.startup,
      },
      limits: {
        ricavi: profile.constants.limits.ricavi,
        uscitaImmediata: profile.constants.limits.uscitaImmediata,
        dipendenti: profile.constants.limits.dipendenti,
        redditoDipendente: profile.constants.limits.redditoDipendente,
      },
    },
  };
}

export function serializeProfile(profile: FiscalProfile) {
  return JSON.stringify(toCanonicalProfile(profile));
}
