import {
  CURRENT_PROFILE,
  type DetrazioneLavoroAutonomoRules,
  type FiscalProfile,
  type IrpefBracket,
} from '../fiscal';
import { calculateForfettario } from './forfettario';
import { calculateInps } from './inps';
import type { ComparisonInput, ComparisonResult, RegimeResult } from './types';

// Detrazione per redditi di lavoro autonomo (art. 13, commi 5 e 7, TUIR 2026).
// I parametri vivono nel profilo fiscale, non nel codice di calcolo.
function calcolaDetrazioneLavoroAutonomo(reddito: number, rules: DetrazioneLavoroAutonomoRules) {
  if (reddito <= 0) {
    return 0;
  }

  let detrazione: number;
  if (reddito <= rules.threshold5500) {
    detrazione = rules.amount1265;
  } else if (reddito <= rules.threshold28000) {
    detrazione =
      rules.base500 + (rules.band765 * (rules.threshold28000 - reddito)) / rules.bandWidth22500;
  } else if (reddito <= rules.threshold50000) {
    detrazione = (rules.base500 * (rules.threshold50000 - reddito)) / rules.width22000;
  } else {
    detrazione = 0;
  }

  if (reddito >= rules.additionalFrom && reddito <= rules.additionalTo) {
    detrazione += rules.additional50;
  }

  return Math.max(0, detrazione);
}

function calculateIrpef(imponibile: number, brackets: readonly IrpefBracket[]) {
  let irpef = 0;
  let remaining = imponibile;
  let previousMax = 0;

  for (const bracket of brackets) {
    if (remaining <= 0) {
      break;
    }

    const max = bracket.max ?? Infinity;
    const taxableInBracket = Math.min(remaining, max - previousMax);
    irpef += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    previousMax = max;
  }

  return irpef;
}

export function compareRegimes(
  input: ComparisonInput,
  profile: FiscalProfile = CURRENT_PROFILE,
): ComparisonResult {
  const tipoInps = input.tipoInps ?? 'gestioneSeparata';
  const riduzioneInps = input.riduzioneInps ?? false;
  const { addizionaliMedie, detrazioneLavoroAutonomo, irpefBrackets } = profile.constants;
  const forfettarioResult = calculateForfettario(
    {
      ricavi: input.ricavi,
      atecoId: input.atecoId,
      contributiVersati: 0,
      mesiAttivita: 12,
      nuovaAttivita: input.nuovaAttivita,
      tipoInps,
      riduzioneInps,
      contributionHistory: input.contributionHistory,
      speseDipendenti: 0,
      redditoDipendente: 0,
    },
    profile,
  );
  const inpsForf = forfettarioResult.contributiConsiderati;
  const impostaForf = forfettarioResult.impostaSostitutiva;
  // Compare cash results: activity costs are paid in both regimes, so subtract
  // the same real costs from the forfettario net as well. The forfettario
  // coefficient still drives the tax base; it only estimates those costs.
  const nettoForf = forfettarioResult.nettoStimato - input.costiReali;

  const redditoLordoOrd = Math.max(0, input.ricavi - input.costiReali);
  const inpsOrd = calculateInps(
    redditoLordoOrd,
    tipoInps,
    false,
    input.contributionHistory,
    12,
    profile,
  ).totale;
  const imponibileOrd = Math.max(0, redditoLordoOrd - inpsOrd);
  const irpefLordaOrd = calculateIrpef(imponibileOrd, irpefBrackets);
  const detrazioneOrd = calcolaDetrazioneLavoroAutonomo(imponibileOrd, detrazioneLavoroAutonomo);
  const irpefOrd = Math.max(0, irpefLordaOrd - detrazioneOrd);
  const addizionaliOrd = imponibileOrd * addizionaliMedie;
  const nettoOrd = input.ricavi - input.costiReali - inpsOrd - irpefOrd - addizionaliOrd;

  const forfettario: RegimeResult = {
    ricavi: input.ricavi,
    costi: input.costiReali,
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
