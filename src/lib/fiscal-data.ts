import {
  CURRENT_PROFILE,
  getAtecoCategory as findAtecoCategory,
  getAtecoCoefficient as findAtecoCoefficient,
} from './fiscal';

// Compatibility facade: existing imports keep working while all fiscal data
// lives in the versioned profile under src/lib/fiscal/.
export type { AtecoCategory, ContributionHistory, InpsType, IrpefBracket } from './fiscal';

export const ATECO_CATEGORIES = CURRENT_PROFILE.constants.ateco;
export const INPS_RATES = CURRENT_PROFILE.constants.inpsRates;
export const ADDIZIONALI_MEDIE = CURRENT_PROFILE.constants.addizionaliMedie;
export const IRPEF_BRACKETS_2026 = CURRENT_PROFILE.constants.irpefBrackets;
export const LIMITS = CURRENT_PROFILE.constants.limits;
export const FISCAL_PROFILE = CURRENT_PROFILE;

export function getAtecoCategory(atecoId: string) {
  return findAtecoCategory(atecoId);
}

export function getAtecoCoefficient(atecoId: string) {
  return findAtecoCoefficient(atecoId);
}
