import { LIMITS, getAtecoCoefficient } from '../fiscal-data';
import { calculateInps } from './inps';
import type { DomainWarning, ForfettarioInput, ForfettarioResult } from './types';

export function calculateForfettario(input: ForfettarioInput): ForfettarioResult {
  const coefficiente = getAtecoCoefficient(input.atecoId) / 100;
  const ricaviRagguagliati = input.mesiAttivita > 0 ? (input.ricavi / input.mesiAttivita) * 12 : 0;
  const redditoLordo = input.ricavi * coefficiente;
  const inps = calculateInps(redditoLordo, input.tipoInps, input.riduzioneInps);
  const contributiConsiderati = input.contributiVersati > 0 ? input.contributiVersati : inps.totale;
  const redditoNettoImponibile = Math.max(0, redditoLordo - contributiConsiderati);
  const aliquotaImposta = input.nuovaAttivita ? 0.05 : 0.15;
  const impostaSostitutiva = redditoNettoImponibile * aliquotaImposta;
  const nettoStimato = input.ricavi - contributiConsiderati - impostaSostitutiva;
  const warnings: DomainWarning[] = [];
  const hasImmediateExit = input.ricavi > LIMITS.uscitaImmediata;

  if (ricaviRagguagliati > LIMITS.ricavi && ricaviRagguagliati <= LIMITS.uscitaImmediata) {
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

  if (input.speseDipendenti > LIMITS.dipendenti) {
    warnings.push({
      code: 'employee-costs-over-limit',
      severity: 'warning',
    });
  }

  if (input.redditoDipendente > LIMITS.redditoDipendente) {
    warnings.push({
      code: 'employment-income-over-limit',
      severity: 'warning',
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
    available: !hasImmediateExit,
    warnings,
  };
}
