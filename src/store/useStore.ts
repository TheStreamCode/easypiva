import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const legacyDisclaimerStorageKey = 'easypiva-storage';
const disclaimerStorageKey = 'easypiva-disclaimer-storage';

function getInitialDisclaimerAccepted() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }

  const currentValue = window.localStorage.getItem(disclaimerStorageKey);
  if (currentValue) {
    try {
      const parsed = JSON.parse(currentValue) as { state?: { hasAcceptedDisclaimer?: boolean } };
      return parsed.state?.hasAcceptedDisclaimer ?? false;
    } catch {
      return false;
    }
  }

  const legacyValue = window.localStorage.getItem(legacyDisclaimerStorageKey);
  if (!legacyValue) {
    return false;
  }

  try {
    const parsed = JSON.parse(legacyValue) as { state?: { hasAcceptedDisclaimer?: boolean } };
    const accepted = parsed.state?.hasAcceptedDisclaimer ?? false;

    if (accepted) {
      window.localStorage.setItem(
        disclaimerStorageKey,
        JSON.stringify({ state: { hasAcceptedDisclaimer: true } })
      );
      window.localStorage.removeItem(legacyDisclaimerStorageKey);
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
    }
  )
);
