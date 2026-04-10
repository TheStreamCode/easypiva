export type WarningCode =
  | 'revenue-over-85000'
  | 'revenue-over-100000'
  | 'employee-costs-over-limit'
  | 'employment-income-over-limit';

export const warningCopy: Record<WarningCode, { title: string; message: string }> = {
  'revenue-over-85000': {
    title: 'Attenzione',
    message:
      "Hai superato la soglia degli 85.000€. L'anno prossimo uscirai dal regime forfettario e passerai al regime ordinario, ma per l'anno in corso mantieni i benefici fiscali.",
  },
  'revenue-over-100000': {
    title: 'CRITICO',
    message:
      "Hai superato la soglia dei 100.000€. Esci IMMEDIATAMENTE dal regime forfettario nell'anno in corso. Dovrai applicare l'IVA sulle fatture successive all'incasso che ha causato il superamento.",
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
