import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createSafePersistStorage,
  readStorageItem,
  removeStorageItem,
  writeStorageItem,
} from '@/lib/browser-storage';

const legacyDisclaimerStorageKey = 'easypiva-storage';
const disclaimerStorageKey = 'easypiva-disclaimer-storage';

function getInitialDisclaimerAccepted() {
  const currentValue = readStorageItem(disclaimerStorageKey);
  if (currentValue) {
    try {
      const parsed = JSON.parse(currentValue) as { state?: { hasAcceptedDisclaimer?: boolean } };
      return parsed.state?.hasAcceptedDisclaimer ?? false;
    } catch {
      return false;
    }
  }

  const legacyValue = readStorageItem(legacyDisclaimerStorageKey);
  if (!legacyValue) {
    return false;
  }

  try {
    const parsed = JSON.parse(legacyValue) as { state?: { hasAcceptedDisclaimer?: boolean } };
    const accepted = parsed.state?.hasAcceptedDisclaimer ?? false;

    if (accepted) {
      writeStorageItem(
        disclaimerStorageKey,
        JSON.stringify({ state: { hasAcceptedDisclaimer: true } }),
      );
      removeStorageItem(legacyDisclaimerStorageKey);
    }

    return accepted;
  } catch {
    return false;
  }
}

interface AppState {
  hasAcceptedDisclaimer: boolean;
  acceptDisclaimer: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hasAcceptedDisclaimer: getInitialDisclaimerAccepted(),
      acceptDisclaimer: () => set({ hasAcceptedDisclaimer: true }),
    }),
    {
      name: disclaimerStorageKey,
      storage: createSafePersistStorage<AppState>(),
    },
  ),
);
