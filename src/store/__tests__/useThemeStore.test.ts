// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

describe('useThemeStore', () => {
  beforeEach(() => {
    vi.resetModules();
    if (localStorageDescriptor) {
      Object.defineProperty(window, 'localStorage', localStorageDescriptor);
      Object.defineProperty(globalThis, 'localStorage', localStorageDescriptor);
    }
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

  it('falls back to the system theme when storage access throws', async () => {
    const failingStorage = {
      getItem: vi.fn(() => {
        throw new DOMException('Blocked', 'SecurityError');
      }),
      setItem: vi.fn(() => {
        throw new DOMException('Blocked', 'SecurityError');
      }),
      removeItem: vi.fn(() => {
        throw new DOMException('Blocked', 'SecurityError');
      }),
      clear: vi.fn(),
      key: vi.fn(() => null),
      length: 0,
    } satisfies Storage;

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: failingStorage,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: failingStorage,
    });

    const matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMedia,
    });

    const { useThemeStore } = await import('../useThemeStore');

    expect(useThemeStore.getState().mode).toBe('dark');
    expect(() => useThemeStore.getState().toggleThemeMode()).not.toThrow();
  });
});
