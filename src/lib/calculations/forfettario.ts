import { LIMITS, getAtecoCoefficient } from '../fiscal-data';
import { calculateInps } from './inps';
import type { ForfettarioInput, ForfettarioResult } from './types';

export function calculateForfettario(input: ForfettarioInput): ForfettarioResult {
  const coefficiente = getAtecoCoefficient(input.atecoId) / 100;
  const ricaviRagguagliati = input.mesiAttivita > 0 ? (input.ricavi / input.mesiAttivita) * 12 : 0;
  const redditoLordo = input.ricavi * coefficiente;
  const redditoNettoImponibile = Math.max(0, redditoLordo - input.contributiVersati);
  const aliquotaImposta = input.nuovaAttivita ? 0.05 : 0.15;
  const impostaSostitutiva = redditoNettoImponibile * aliquotaImposta;
  const inps = calculateInps(redditoLordo, input.tipoInps, input.riduzioneInps);
  const nettoStimato = input.ricavi - impostaSostitutiva - inps.totale;
  const warnings: string[] = [];

  if (ricaviRagguagliati > LIMITS.ricavi && ricaviRagguagliati <= LIMITS.uscitaImmediata) {
    warnings.push("Attenzione: I ricavi ragguagliati superano 85.000€. Uscirai dal regime forfettario l'anno prossimo.");
  }

  if (ricaviRagguagliati > LIMITS.uscitaImmediata) {
    warnings.push('CRITICO: I ricavi superano 100.000€. Uscita immediata dal regime forfettario nell\'anno in corso!');
  }

  if (input.speseDipendenti > LIMITS.dipendenti) {
    warnings.push('Attenzione: Le spese per dipendenti superano il limite di 20.000€.');
  }

  if (input.redditoDipendente > LIMITS.redditoDipendente) {
    warnings.push('Attenzione: Il reddito da lavoro dipendente/pensione supera 35.000€. Non puoi accedere al regime forfettario.');
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
