export type AssumptionChangeItem = {
  field: string;
  from: string;
  to: string;
  /** Fiscal source id from the profile, when the change comes from a norm. */
  sourceId?: string;
};

export type AssumptionChange = {
  version: string;
  date: string;
  appRelease: string;
  summary: string;
  changes: readonly AssumptionChangeItem[];
};

// One entry per assumption-set version. The first version records the baseline
// and the corrections that were previously undocumented, so the history starts
// with an honest diff instead of an empty section.
export const ASSUMPTION_CHANGES: readonly AssumptionChange[] = [
  {
    version: '2026.1',
    date: '2026-10-25',
    appRelease: '1.2.0',
    summary:
      'Introduzione del profilo versionato: assunzioni 2026 consolidate e allineate a TUIR 2026 e TU-IVA 2026.',
    changes: [
      {
        field: 'limits.redditoDipendente',
        from: '35.000 €',
        to: '30.000 €',
        sourceId: 'tuir-2026',
      },
      {
        field: 'sources.forfettario',
        from: 'L. 190/2014, commi 54-89',
        to: 'D.Lgs. 117/2026, artt. 232-243 e Allegato D',
        sourceId: 'tuir-2026',
      },
      {
        field: 'constants.ateco',
        from: 'etichette per macro-categorie 45-47',
        to: 'Allegato D (45, 46.2-46.9, 47.1-47.7, 47.9 e 46.1 separati)',
        sourceId: 'tuir-2026',
      },
      {
        field: 'constants.detrazioneLavoroAutonomo',
        from: 'valori fissi nel codice',
        to: 'art. 13, commi 5 e 7, TUIR 2026',
        sourceId: 'tuir-2026',
      },
      {
        field: 'rounding',
        from: 'valori impliciti nel codice',
        to: 'valuta 0 decimali; scala preventivo 6 decimali',
      },
    ],
  },
];
