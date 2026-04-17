import { IRPEF_BRACKETS_2026 } from '../fiscal-data';
import { calculateForfettario } from './forfettario';
import { calculateInps } from './inps';
import type { ComparisonInput, ComparisonResult, RegimeResult } from './types';

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
  const irpefOrd = calculateIrpef(imponibileOrd);
  const addizionaliOrd = imponibileOrd * 0.02;
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
