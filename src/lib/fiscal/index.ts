import { fiscalProfile2026_1 } from './profiles/2026.1';
import type { AtecoCategory, FiscalProfile } from './types';

// Ordered from oldest to newest. Archived profiles stay here forever so a past
// estimate can be recomputed with the exact assumption set it used.
export const PROFILES: readonly FiscalProfile[] = [fiscalProfile2026_1];

export const CURRENT_PROFILE: FiscalProfile = PROFILES[PROFILES.length - 1];

export function getProfile(version: string): FiscalProfile | undefined {
  return PROFILES.find((profile) => profile.version === version);
}

export function isProfileCurrent(profileOrVersion: FiscalProfile | string): boolean {
  const version =
    typeof profileOrVersion === 'string' ? profileOrVersion : profileOrVersion.version;
  return version === CURRENT_PROFILE.version;
}

export function getCurrentAtecoCategories(): readonly AtecoCategory[] {
  return CURRENT_PROFILE.constants.ateco;
}

export function getAtecoCategory(
  atecoId: string,
  profile: FiscalProfile = CURRENT_PROFILE,
): AtecoCategory | undefined {
  return profile.constants.ateco.find((category) => category.id === atecoId);
}

export function getAtecoCoefficient(atecoId: string, profile: FiscalProfile = CURRENT_PROFILE) {
  return (
    getAtecoCategory(atecoId, profile)?.coefficient ?? profile.constants.atecoDefaultCoefficient
  );
}

export type {
  AtecoCategory,
  ArtigianiCommerciantiRates,
  ContributionHistory,
  DetrazioneLavoroAutonomoRules,
  FiscalConstants,
  FiscalLimits,
  FiscalProfile,
  FiscalProfileStatus,
  FiscalSource,
  GestioneSeparataRates,
  InpsRates,
  InpsType,
  IrpefBracket,
  RoundingRules,
} from './types';
