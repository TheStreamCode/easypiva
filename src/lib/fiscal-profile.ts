import { CURRENT_PROFILE } from './fiscal';

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatIsoDate(value: string) {
  return dateFormatter.format(parseIsoDate(value));
}

export const FISCAL_PROFILE_JSON_PATH = '/fiscal-profile.json';

export function formatFiscalProfileValidFrom() {
  return formatIsoDate(CURRENT_PROFILE.validFrom);
}

export function formatFiscalProfileValidTo() {
  return CURRENT_PROFILE.validTo ? formatIsoDate(CURRENT_PROFILE.validTo) : null;
}

/** Validity interval of the active assumption set, in Italian. */
export function formatFiscalProfileValidity() {
  const from = `in vigore dal ${formatFiscalProfileValidFrom()}`;
  const to = formatFiscalProfileValidTo();
  return to ? `${from} al ${to}` : from;
}

export function getFiscalProfileChecksumShort() {
  return CURRENT_PROFILE.checksum.replace(/^sha256:/, '').slice(0, 12);
}

/** Human-readable label shown in the UI next to simulation results. */
export function formatFiscalProfileLabel() {
  return `assunzioni fiscali ${CURRENT_PROFILE.year}, versione ${CURRENT_PROFILE.version} (${formatFiscalProfileValidity()})`;
}

/** Title used by the calculator PDF export. */
export function getCalculatorPdfTitle() {
  return `Report EasyPIVA - Calcolo Forfettario ${CURRENT_PROFILE.year} (assunzioni ${CURRENT_PROFILE.version})`;
}
