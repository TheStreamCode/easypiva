import { LIMITS } from '../fiscal-data';
import type { PlanningResult } from './types';

const mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

export function buildPlanningProjection(ricaviMensili: number[]): PlanningResult {
  let cumulato = 0;
  const chartData = mesi.map((mese, index) => {
    cumulato += ricaviMensili[index] ?? 0;

    return {
      name: mese,
      Ricavi: ricaviMensili[index] ?? 0,
      Cumulato: cumulato,
    };
  });

  const totaleAnnuo = cumulato;
  const limiteSuperato = totaleAnnuo > LIMITS.ricavi;
  const uscitaImmediata = totaleAnnuo > LIMITS.uscitaImmediata;
  const warnings: string[] = [];

  if (limiteSuperato && !uscitaImmediata) {
    warnings.push("Attenzione: Hai superato la soglia degli 85.000€. L'anno prossimo uscirai dal regime forfettario e passerai al regime ordinario, ma per l'anno in corso mantieni i benefici fiscali.");
  }

  if (uscitaImmediata) {
    warnings.push("CRITICO: Hai superato la soglia dei 100.000€. Esci IMMEDIATAMENTE dal regime forfettario nell'anno in corso. Dovrai applicare l'IVA sulle fatture successive all'incasso che ha causato il superamento.");
  }

  return {
    chartData,
    totaleAnnuo,
    limiteSuperato,
    uscitaImmediata,
    warnings,
  };
}
