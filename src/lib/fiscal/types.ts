export type AtecoCategory = {
  id: string;
  name: string;
  coefficient: number;
};

export type InpsType = 'gestioneSeparata' | 'artigiani' | 'commercianti' | 'nessuno';
export type ContributionHistory = 'pre1996' | 'post1995';

export type GestioneSeparataRates = {
  rate: number;
  massimale: number;
};

export type ArtigianiCommerciantiRates = {
  minimalIncome: number;
  minimalContribution: number;
  rateOverMinimal: number;
  surchargeThreshold: number;
  surchargeRate: number;
  massimalePre1996: number;
  massimalePost1995: number;
};

export type InpsRates = {
  gestioneSeparata: GestioneSeparataRates;
  artigiani: ArtigianiCommerciantiRates;
  commercianti: ArtigianiCommerciantiRates;
};

/** `max: null` means the bracket has no upper limit (serializable equivalent of Infinity). */
export type IrpefBracket = {
  max: number | null;
  rate: number;
};

export type DetrazioneLavoroAutonomoRules = {
  threshold5500: number;
  amount1265: number;
  threshold28000: number;
  base500: number;
  band765: number;
  bandWidth22500: number;
  threshold50000: number;
  width22000: number;
  additional50: number;
  additionalFrom: number;
  additionalTo: number;
};

export type FiscalLimits = {
  ricavi: number;
  uscitaImmediata: number;
  dipendenti: number;
  redditoDipendente: number;
};

export type RoundingRules = {
  currencyDecimals: number;
  quoteComputationDecimals: number;
};

export type FiscalSource = {
  id: string;
  label: string;
  url: string;
};

export type FiscalConstants = {
  ateco: readonly AtecoCategory[];
  atecoDefaultCoefficient: number;
  inpsRates: InpsRates;
  inpsRiduzioneForfettari: number;
  addizionaliMedie: number;
  irpefBrackets: readonly IrpefBracket[];
  detrazioneLavoroAutonomo: DetrazioneLavoroAutonomoRules;
  sostitutiva: {
    standard: number;
    startup: number;
  };
  limits: FiscalLimits;
};

export type FiscalProfileStatus = 'current' | 'archived';

export type FiscalProfile = {
  year: number;
  /** Assumption set version, formatted as `<year>.<progressive>`, e.g. `2026.1`. */
  version: string;
  status: FiscalProfileStatus;
  validFrom: string;
  validTo: string | null;
  reviewedAt: string;
  checksum: string;
  sources: readonly FiscalSource[];
  rounding: RoundingRules;
  constants: FiscalConstants;
};
