import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  applyThemeMode,
  initializeThemeMode,
  type ThemeMode,
  themeStorageKey,
} from '@/lib/theme';

interface ThemeState {
  mode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

const initialMode = initializeThemeMode();

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: initialMode,
      setThemeMode: (mode) => {
        applyThemeMode(mode);
        set({ mode });
      },
      toggleThemeMode: () => {
        const nextMode = get().mode === 'dark' ? 'light' : 'dark';
        applyThemeMode(nextMode);
        set({ mode: nextMode });
      },
    }),
    {
      name: themeStorageKey,
      partialize: ({ mode }) => ({ mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeMode(state.mode);
        }
      },
    }
  )
);
