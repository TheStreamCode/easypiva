import { describe, expect, it } from 'vitest';
import { getThemeRevealRadius } from './theme';

describe('getThemeRevealRadius', () => {
  it('returns the minimum diameter needed to cover the viewport', () => {
    expect(getThemeRevealRadius(0, 0, 100, 100)).toBe(142);
    expect(getThemeRevealRadius(50, 50, 100, 100)).toBe(71);
  });
});
