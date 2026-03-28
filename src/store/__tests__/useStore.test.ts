// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useStore disclaimer migration', () => {
  beforeEach(() => {
    vi.resetModules();
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
});
