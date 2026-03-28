export const ATECO_CATEGORIES = [
  { id: '1', name: 'Industrie alimentari e delle bevande (10-11)', coefficient: 40 },
  { id: '2', name: 'Commercio all\'ingrosso e al dettaglio (45-47)', coefficient: 40 },
  { id: '3', name: 'Commercio ambulante di prodotti alimentari e bevande (47.81)', coefficient: 40 },
  { id: '4', name: 'Commercio ambulante di altri prodotti (47.82-47.89)', coefficient: 54 },
  { id: '5', name: 'Costruzioni e attività immobiliari (41-43, 68)', coefficient: 86 },
  { id: '6', name: 'Intermediari del commercio (46.1)', coefficient: 62 },
  { id: '7', name: 'Attività dei servizi di alloggio e di ristorazione (55-56)', coefficient: 40 },
  { id: '8', name: 'Attività professionali, scientifiche, tecniche, sanitarie, di istruzione, servizi finanziari (64-66, 69-75, 85, 86-88)', coefficient: 78 },
  { id: '9', name: 'Altre attività economiche (01-09, 12-33, 35-39, 49-53, 58-63, 77-82, 90-99)', coefficient: 67 },
];

export const INPS_RATES = {
  gestioneSeparata: {
    rate: 0.2607,
  },
  artigiani: {
    minimalIncome: 18415,
    minimalContribution: 4427.04,
    rateOverMinimal: 0.24,
  },
  commercianti: {
    minimalIncome: 18415,
    minimalContribution: 4515.43,
    rateOverMinimal: 0.2448,
  }
};

export const IRPEF_BRACKETS_2026 = [
  { max: 28000, rate: 0.23 },
  { max: 50000, rate: 0.35 },
  { max: Infinity, rate: 0.43 },
];

export const LIMITS = {
  ricavi: 85000,
  uscitaImmediata: 100000,
  dipendenti: 20000,
  redditoDipendente: 35000,
};
