// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

describe('useStore disclaimer migration', () => {
  beforeEach(() => {
    vi.resetModules();
    if (localStorageDescriptor) {
      Object.defineProperty(window, 'localStorage', localStorageDescriptor);
      Object.defineProperty(globalThis, 'localStorage', localStorageDescriptor);
    }
    window.localStorage.clear();
  });

  it('keeps accepted disclaimer from the legacy storage key', async () => {
    window.localStorage.setItem(
      'easypiva-storage',
      JSON.stringify({ state: { hasAcceptedDisclaimer: true } }),
    );

    const { useStore } = await import('../useStore');

    expect(useStore.getState().hasAcceptedDisclaimer).toBe(true);
  });

  it('falls back safely when browser storage access throws', async () => {
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

    const { useStore } = await import('../useStore');

    expect(useStore.getState().hasAcceptedDisclaimer).toBe(false);
    expect(() => useStore.getState().acceptDisclaimer()).not.toThrow();
  });
});
