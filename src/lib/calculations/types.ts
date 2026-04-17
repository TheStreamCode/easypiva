import type { InpsType } from '../fiscal-data';

export type WarningSeverity = 'warning' | 'critical';

export type WarningCode =
  | 'revenue-over-85000'
  | 'revenue-over-100000'
  | 'employee-costs-over-limit'
  | 'employment-income-over-limit';

export type DomainWarning = {
  code: WarningCode;
  severity: WarningSeverity;
};

export type ForfettarioInput = {
  ricavi: number;
  atecoId: string;
  contributiVersati: number;
  mesiAttivita: number;
  nuovaAttivita: boolean;
  tipoInps: InpsType;
  riduzioneInps: boolean;
  speseDipendenti: number;
  redditoDipendente: number;
};

export type InpsCalculation = {
  fisso: number;
  variabile: number;
  totale: number;
};

export type ForfettarioResult = {
  atecoId: string;
  coefficiente: number;
  ricaviRagguagliati: number;
  redditoLordo: number;
  contributiConsiderati: number;
  redditoNettoImponibile: number;
  aliquotaImposta: number;
  impostaSostitutiva: number;
  inps: InpsCalculation;
  nettoStimato: number;
  available: boolean;
  warnings: DomainWarning[];
};

export type ComparisonInput = {
  ricavi: number;
  costiReali: number;
  atecoId: string;
  nuovaAttivita: boolean;
  tipoInps?: InpsType;
  riduzioneInps?: boolean;
};

export type RegimeResult = {
  ricavi: number;
  costi: number;
  inps: number;
  tasse: number;
  netto: number;
  available: boolean;
};

export type ComparisonResult = {
  winner: 'forfettario' | 'ordinario' | 'pareggio';
  deltaNetto: number;
  forfettario: RegimeResult;
  ordinario: RegimeResult;
};

export type TargetNetInput = {
  nettoMensile: number;
  atecoId: string;
  nuovaAttivita: boolean;
  tipoInps: InpsType;
  riduzioneInps: boolean;
};

export type TargetNetResult = {
  nettoAnnuo: number;
  ricaviNecessari: number;
  inpsStimato: number;
  tasseStimate: number;
  costiForfettari: number;
  available: boolean;
  warnings: WarningCode[];
};

export type PlanningResult = {
  projection: ProjectionPoint[];
  totaleAnnuo: number;
  limiteSuperato: boolean;
  uscitaImmediata: boolean;
  warnings: DomainWarning[];
};

export type ProjectionPoint = {
  month: string;
  revenue: number;
  cumulativeRevenue: number;
};
