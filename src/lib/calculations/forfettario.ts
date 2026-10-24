import { LIMITS, getAtecoCoefficient } from '../fiscal-data';
import { calculateInps } from './inps';
import type { DomainWarning, ForfettarioInput, ForfettarioResult } from './types';

export function calculateForfettario(input: ForfettarioInput): ForfettarioResult {
  const coefficiente = getAtecoCoefficient(input.atecoId) / 100;
  const ricaviRagguagliati = input.mesiAttivita > 0 ? (input.ricavi / input.mesiAttivita) * 12 : 0;
  const redditoLordo = input.ricavi * coefficiente;
  const inps = calculateInps(
    redditoLordo,
    input.tipoInps,
    input.riduzioneInps,
    input.contributionHistory,
    input.mesiAttivita,
  );
  const contributiConsiderati = input.contributiVersati > 0 ? input.contributiVersati : inps.totale;
  const redditoNettoImponibile = Math.max(0, redditoLordo - contributiConsiderati);
  const aliquotaImposta = input.nuovaAttivita ? 0.05 : 0.15;
  const impostaSostitutiva = redditoNettoImponibile * aliquotaImposta;
  const nettoStimato = input.ricavi - contributiConsiderati - impostaSostitutiva;
  const warnings: DomainWarning[] = [];
  const hasImmediateExit = input.ricavi > LIMITS.uscitaImmediata;
  const hasEmployeeCostsOverLimit = input.speseDipendenti > LIMITS.dipendenti;
  const hasEmploymentIncomeOverLimit = input.redditoDipendente > LIMITS.redditoDipendente;

  if (ricaviRagguagliati > LIMITS.ricavi && !hasImmediateExit) {
    warnings.push({
      code: 'revenue-over-85000',
      severity: 'warning',
    });
  }

  if (hasImmediateExit) {
    warnings.push({
      code: 'revenue-over-100000',
      severity: 'critical',
    });
  }

  if (hasEmployeeCostsOverLimit) {
    warnings.push({
      code: 'employee-costs-over-limit',
      severity: 'critical',
    });
  }

  if (hasEmploymentIncomeOverLimit) {
    warnings.push({
      code: 'employment-income-over-limit',
      severity: 'critical',
    });
  }

  return {
    atecoId: input.atecoId,
    coefficiente,
    ricaviRagguagliati,
    redditoLordo,
    contributiConsiderati,
    redditoNettoImponibile,
    aliquotaImposta,
    impostaSostitutiva,
    inps,
    nettoStimato,
    // Both requirement failures are exclusion causes for the regime, not mere notes.
    available: !hasImmediateExit && !hasEmployeeCostsOverLimit && !hasEmploymentIncomeOverLimit,
    warnings,
  };
}
