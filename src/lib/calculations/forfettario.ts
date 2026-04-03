import { LIMITS, getAtecoCoefficient } from '../fiscal-data';
import { calculateInps } from './inps';
import type { DomainWarning, ForfettarioInput, ForfettarioResult } from './types';

export function calculateForfettario(input: ForfettarioInput): ForfettarioResult {
  const coefficiente = getAtecoCoefficient(input.atecoId) / 100;
  const ricaviRagguagliati = input.mesiAttivita > 0 ? (input.ricavi / input.mesiAttivita) * 12 : 0;
  const redditoLordo = input.ricavi * coefficiente;
  const redditoNettoImponibile = Math.max(0, redditoLordo - input.contributiVersati);
  const aliquotaImposta = input.nuovaAttivita ? 0.05 : 0.15;
  const impostaSostitutiva = redditoNettoImponibile * aliquotaImposta;
  const inps = calculateInps(redditoLordo, input.tipoInps, input.riduzioneInps);
  const nettoStimato = input.ricavi - input.contributiVersati - impostaSostitutiva - inps.totale;
  const warnings: DomainWarning[] = [];

  if (ricaviRagguagliati > LIMITS.ricavi && ricaviRagguagliati <= LIMITS.uscitaImmediata) {
    warnings.push({
      code: 'revenue-over-85000',
      severity: 'warning',
    });
  }

  if (ricaviRagguagliati > LIMITS.uscitaImmediata) {
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
    redditoNettoImponibile,
    aliquotaImposta,
    impostaSostitutiva,
    inps,
    nettoStimato,
    warnings,
  };
}
