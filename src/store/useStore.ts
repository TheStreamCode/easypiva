import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  hasAcceptedDisclaimer: boolean;
  acceptDisclaimer: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      hasAcceptedDisclaimer: false,
      acceptDisclaimer: () => set({ hasAcceptedDisclaimer: true }),
    }),
    {
      name: 'easypiva-storage',
    }
  )
);
