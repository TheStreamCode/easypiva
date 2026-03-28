import type { InpsType } from '../fiscal-data';

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
  redditoNettoImponibile: number;
  aliquotaImposta: number;
  impostaSostitutiva: number;
  inps: InpsCalculation;
  nettoStimato: number;
  warnings: string[];
};

export type ComparisonInput = {
  ricavi: number;
  costiReali: number;
  atecoId: string;
  nuovaAttivita: boolean;
};

export type RegimeResult = {
  ricavi: number;
  costi: number;
  inps: number;
  tasse: number;
  netto: number;
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
};

export type PlanningResult = {
  chartData: Array<{ name: string; Ricavi: number; Cumulato: number }>;
  totaleAnnuo: number;
  limiteSuperato: boolean;
  uscitaImmediata: boolean;
  warnings: string[];
};
