import { IRPEF_BRACKETS_2026, getAtecoCoefficient } from '../fiscal-data';
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
  const coefficiente = getAtecoCoefficient(input.atecoId) / 100;
  const redditoLordoForf = input.ricavi * coefficiente;
  const tipoInps = input.tipoInps ?? 'gestioneSeparata';
  const riduzioneInps = input.riduzioneInps ?? false;
  const inpsForf = calculateInps(redditoLordoForf, tipoInps, riduzioneInps).totale;
  const imponibileForf = Math.max(0, redditoLordoForf - inpsForf);
  const impostaForf = imponibileForf * (input.nuovaAttivita ? 0.05 : 0.15);
  const nettoForf = input.ricavi - impostaForf - inpsForf;

  const redditoLordoOrd = Math.max(0, input.ricavi - input.costiReali);
  const inpsOrd = calculateInps(redditoLordoOrd, tipoInps, riduzioneInps).totale;
  const imponibileOrd = Math.max(0, redditoLordoOrd - inpsOrd);
  const irpefOrd = calculateIrpef(imponibileOrd);
  const addizionaliOrd = imponibileOrd * 0.02;
  const nettoOrd = input.ricavi - input.costiReali - inpsOrd - irpefOrd - addizionaliOrd;

  const forfettario: RegimeResult = {
    ricavi: input.ricavi,
    costi: input.ricavi - redditoLordoForf,
    inps: inpsForf,
    tasse: impostaForf,
    netto: nettoForf,
  };

  const ordinario: RegimeResult = {
    ricavi: input.ricavi,
    costi: input.costiReali,
    inps: inpsOrd,
    tasse: irpefOrd + addizionaliOrd,
    netto: nettoOrd,
  };

  const deltaNetto = nettoForf - nettoOrd;

  return {
    winner: deltaNetto > 0 ? 'forfettario' : deltaNetto < 0 ? 'ordinario' : 'pareggio',
    deltaNetto,
    forfettario,
    ordinario,
  };
}
