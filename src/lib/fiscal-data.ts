export type AtecoCategory = {
  id: string;
  name: string;
  coefficient: number;
};

export type InpsType = 'gestioneSeparata' | 'artigiani' | 'commercianti' | 'nessuno';
export type ContributionHistory = 'pre1996' | 'post1995';

export const ATECO_CATEGORIES: AtecoCategory[] = [
  { id: '1', name: 'Industrie alimentari e delle bevande (10-11)', coefficient: 40 },
  { id: '2', name: "Commercio all'ingrosso e al dettaglio (45-47)", coefficient: 40 },
  {
    id: '3',
    name: 'Commercio ambulante di prodotti alimentari e bevande (47.81)',
    coefficient: 40,
  },
  { id: '4', name: 'Commercio ambulante di altri prodotti (47.82-47.89)', coefficient: 54 },
  { id: '5', name: 'Costruzioni e attività immobiliari (41-43, 68)', coefficient: 86 },
  { id: '6', name: 'Intermediari del commercio (46.1)', coefficient: 62 },
  { id: '7', name: 'Attività dei servizi di alloggio e di ristorazione (55-56)', coefficient: 40 },
  {
    id: '8',
    name: 'Attività professionali, scientifiche, tecniche, sanitarie, di istruzione, servizi finanziari (64-66, 69-75, 85, 86-88)',
    coefficient: 78,
  },
  {
    id: '9',
    name: 'Altre attività economiche (01-09, 12-33, 35-39, 49-53, 58-63, 77-82, 90-99)',
    coefficient: 67,
  },
];

// Valori 2026 — Circ. INPS 8/2026 (Gestione Separata) e 14/2026 (Artigiani/Commercianti).
// surchargeThreshold: oltre questa soglia di reddito l'aliquota IVS sale di +1% (25% / 25,48%).
// I massimali Artigiani/Commercianti dipendono dall'anzianità contributiva al 31/12/1995.
export const INPS_RATES = {
  gestioneSeparata: {
    rate: 0.2607,
    massimale: 122295,
  },
  artigiani: {
    minimalIncome: 18808,
    minimalContribution: 4521.36,
    rateOverMinimal: 0.24,
    surchargeThreshold: 56224,
    surchargeRate: 0.01,
    massimalePre1996: 93707,
    massimalePost1995: 122295,
  },
  commercianti: {
    minimalIncome: 18808,
    minimalContribution: 4611.64,
    rateOverMinimal: 0.2448,
    surchargeThreshold: 56224,
    surchargeRate: 0.01,
    massimalePre1996: 93707,
    massimalePost1995: 122295,
  },
} as const;

// Aliquota media addizionali regionali + comunali usata nel confronto col regime ordinario.
// È una stima rappresentativa: le aliquote reali variano per regione (~1,23%–3,33%) e comune (0%–0,9%).
export const ADDIZIONALI_MEDIE = 0.02;

export const IRPEF_BRACKETS_2026 = [
  { max: 28000, rate: 0.23 },
  { max: 50000, rate: 0.33 },
  { max: Infinity, rate: 0.43 },
] as const;

export const LIMITS = {
  ricavi: 85000,
  uscitaImmediata: 100000,
  dipendenti: 20000,
  redditoDipendente: 35000,
} as const;

export function getAtecoCategory(atecoId: string) {
  return ATECO_CATEGORIES.find((category) => category.id === atecoId);
}

export function getAtecoCoefficient(atecoId: string) {
  return getAtecoCategory(atecoId)?.coefficient ?? 78;
}
