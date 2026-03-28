// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('persists theme changes and syncs the root class', async () => {
    const { useThemeStore } = await import('../useThemeStore');
    const { themeStorageKey } = await import('@/lib/theme');

    expect(useThemeStore.getState().mode).toBe('light');

    useThemeStore.getState().setThemeMode('dark');

    expect(useThemeStore.getState().mode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem(themeStorageKey)).toContain('dark');

    useThemeStore.getState().toggleThemeMode();

    expect(useThemeStore.getState().mode).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem(themeStorageKey)).toContain('light');
  });
});
