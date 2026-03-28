export type ThemeMode = 'light' | 'dark';

export const themeStorageKey = 'easypiva-theme-mode';

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getSystemThemeMode(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readPersistedThemeMode(): ThemeMode | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const stored = window.localStorage.getItem(themeStorageKey);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as { state?: { mode?: string } };
    const mode = parsed.state?.mode;
    return mode === 'dark' || mode === 'light' ? mode : null;
  } catch {
    return null;
  }
}

export function getInitialThemeMode(): ThemeMode {
  return readPersistedThemeMode() ?? getSystemThemeMode();
}

export function applyThemeMode(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', mode === 'dark');
}

export function persistThemeMode(mode: ThemeMode) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(themeStorageKey, JSON.stringify({ state: { mode } }));
}

export function initializeThemeMode() {
  const mode = getInitialThemeMode();
  applyThemeMode(mode);
  return mode;
}
