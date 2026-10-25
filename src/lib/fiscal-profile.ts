import { FISCAL_PROFILE } from './fiscal-data';

const validFromFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatFiscalProfileValidFrom() {
  return validFromFormatter.format(parseIsoDate(FISCAL_PROFILE.validFrom));
}

/** Human-readable label shown in the UI next to simulation results. */
export function formatFiscalProfileLabel() {
  return `assunzioni fiscali ${FISCAL_PROFILE.year}, versione ${FISCAL_PROFILE.version} (in vigore dal ${formatFiscalProfileValidFrom()})`;
}

/** Title used by the calculator PDF export. */
export function getCalculatorPdfTitle() {
  return `Report EasyPIVA - Calcolo Forfettario ${FISCAL_PROFILE.year} (assunzioni ${FISCAL_PROFILE.version})`;
}
