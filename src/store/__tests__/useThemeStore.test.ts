// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getInitialThemeMode, applyThemeMode, themeStorageKey } from '@/lib/theme';

describe('theme helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
    vi.restoreAllMocks();
  });

  it('uses the persisted theme mode and applies the root class', () => {
    window.localStorage.setItem(themeStorageKey, 'dark');

    expect(getInitialThemeMode()).toBe('dark');

    applyThemeMode('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    applyThemeMode('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
