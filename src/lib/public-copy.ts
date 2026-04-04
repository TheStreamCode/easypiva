export type WarningCode =
  | 'revenue-over-85000'
  | 'revenue-over-100000'
  | 'employee-costs-over-limit'
  | 'employment-income-over-limit';

export const warningCopy: Record<WarningCode, { title: string; message: string }> = {
  'revenue-over-85000': {
    title: 'Attenzione',
    message:
      "I ricavi ragguagliati superano 85.000€. Uscirai dal regime forfettario l'anno prossimo.",
  },
  'revenue-over-100000': {
    title: 'CRITICO',
    message:
      "I ricavi superano 100.000€. Uscita immediata dal regime forfettario nell'anno in corso!",
  },
  'employee-costs-over-limit': {
    title: 'Attenzione',
    message: 'Le spese per dipendenti superano il limite di 20.000€.',
  },
  'employment-income-over-limit': {
    title: 'Attenzione',
    message:
      'Il reddito da lavoro dipendente/pensione supera 35.000€. Non puoi accedere al regime forfettario.',
  },
};
