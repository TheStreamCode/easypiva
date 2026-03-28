import { LIMITS, getAtecoCoefficient, normalizeInpsType } from '../fiscal-data';
import { calculateInps } from './inps';
import type { DomainWarning, ForfettarioInput, ForfettarioResult } from './types';

export function calculateForfettario(input: ForfettarioInput): ForfettarioResult {
  const coefficiente = getAtecoCoefficient(input.atecoId) / 100;
  const ricaviRagguagliati = input.mesiAttivita > 0 ? (input.ricavi / input.mesiAttivita) * 12 : 0;
  const redditoLordo = input.ricavi * coefficiente;
  const redditoNettoImponibile = Math.max(0, redditoLordo - input.contributiVersati);
  const aliquotaImposta = input.nuovaAttivita ? 0.05 : 0.15;
  const impostaSostitutiva = redditoNettoImponibile * aliquotaImposta;
  const inps = calculateInps(redditoLordo, normalizeInpsType(input.tipoInps), input.riduzioneInps);
  const nettoStimato = input.ricavi - impostaSostitutiva - inps.totale;
  const warnings: DomainWarning[] = [];

  if (ricaviRagguagliati > LIMITS.ricavi && ricaviRagguagliati <= LIMITS.uscitaImmediata) {
    warnings.push({
      code: 'revenue-over-85000',
      severity: 'warning',
      message: "I ricavi ragguagliati superano 85.000€. Uscirai dal regime forfettario l'anno prossimo.",
    });
  }

  if (ricaviRagguagliati > LIMITS.uscitaImmediata) {
    warnings.push({
      code: 'revenue-over-100000',
      severity: 'critical',
      message: 'I ricavi superano 100.000€. Uscita immediata dal regime forfettario nell\'anno in corso!',
    });
  }

  if (input.speseDipendenti > LIMITS.dipendenti) {
    warnings.push({
      code: 'employee-costs-over-limit',
      severity: 'warning',
      message: 'Le spese per dipendenti superano il limite di 20.000€.',
    });
  }

  if (input.redditoDipendente > LIMITS.redditoDipendente) {
    warnings.push({
      code: 'employment-income-over-limit',
      severity: 'warning',
      message: 'Il reddito da lavoro dipendente/pensione supera 35.000€. Non puoi accedere al regime forfettario.',
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
