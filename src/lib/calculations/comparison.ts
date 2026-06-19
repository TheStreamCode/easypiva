import { ADDIZIONALI_MEDIE, IRPEF_BRACKETS_2026 } from '../fiscal-data';
import { calculateForfettario } from './forfettario';
import { calculateInps } from './inps';
import type { ComparisonInput, ComparisonResult, RegimeResult } from './types';

// Detrazione per redditi di lavoro autonomo (art. 13 c. 5-5bis TUIR, importi 2026).
// Decrescente al crescere del reddito, si azzera oltre 50.000 €.
function calcolaDetrazioneLavoroAutonomo(reddito: number) {
  if (reddito <= 0) {
    return 0;
  }

  let detrazione: number;
  if (reddito <= 5500) {
    detrazione = 1265;
  } else if (reddito <= 28000) {
    detrazione = 500 + (765 * (28000 - reddito)) / 22500;
  } else if (reddito <= 50000) {
    detrazione = (500 * (50000 - reddito)) / 22000;
  } else {
    detrazione = 0;
  }

  // Ulteriore detrazione di 50 € per redditi tra 11.000 e 17.000 €.
  if (reddito >= 11000 && reddito <= 17000) {
    detrazione += 50;
  }

  return Math.max(0, detrazione);
}

function calculateIrpef(imponibile: number) {
  let irpef = 0;
  let remaining = imponibile;
  let previousMax = 0;

  for (const bracket of IRPEF_BRACKETS_2026) {
    if (remaining <= 0) {
      break;
    }

    const taxableInBracket = Math.min(remaining, bracket.max - previousMax);
    irpef += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    previousMax = bracket.max;
  }

  return irpef;
}

export function compareRegimes(input: ComparisonInput): ComparisonResult {
  const tipoInps = input.tipoInps ?? 'gestioneSeparata';
  const riduzioneInps = input.riduzioneInps ?? false;
  const forfettarioResult = calculateForfettario({
    ricavi: input.ricavi,
    atecoId: input.atecoId,
    contributiVersati: 0,
    mesiAttivita: 12,
    nuovaAttivita: input.nuovaAttivita,
    tipoInps,
    riduzioneInps,
    speseDipendenti: 0,
    redditoDipendente: 0,
  });
  const inpsForf = forfettarioResult.contributiConsiderati;
  const impostaForf = forfettarioResult.impostaSostitutiva;
  const nettoForf = forfettarioResult.nettoStimato;

  const redditoLordoOrd = Math.max(0, input.ricavi - input.costiReali);
  const inpsOrd = calculateInps(redditoLordoOrd, tipoInps, false).totale;
  const imponibileOrd = Math.max(0, redditoLordoOrd - inpsOrd);
  const irpefLordaOrd = calculateIrpef(imponibileOrd);
  const detrazioneOrd = calcolaDetrazioneLavoroAutonomo(imponibileOrd);
  const irpefOrd = Math.max(0, irpefLordaOrd - detrazioneOrd);
  const addizionaliOrd = imponibileOrd * ADDIZIONALI_MEDIE;
  const nettoOrd = input.ricavi - input.costiReali - inpsOrd - irpefOrd - addizionaliOrd;

  const forfettario: RegimeResult = {
    ricavi: input.ricavi,
    costi: input.ricavi - forfettarioResult.redditoLordo,
    inps: inpsForf,
    tasse: impostaForf,
    netto: nettoForf,
    available: forfettarioResult.available,
  };

  const ordinario: RegimeResult = {
    ricavi: input.ricavi,
    costi: input.costiReali,
    inps: inpsOrd,
    tasse: irpefOrd + addizionaliOrd,
    netto: nettoOrd,
    available: true,
  };

  const deltaNetto = forfettario.available ? nettoForf - nettoOrd : -Math.abs(nettoOrd);

  return {
    winner: !forfettario.available
      ? 'ordinario'
      : deltaNetto > 0
        ? 'forfettario'
        : deltaNetto < 0
          ? 'ordinario'
          : 'pareggio',
    deltaNetto,
    forfettario,
    ordinario,
  };
}
