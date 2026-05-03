import { describe, expect, it } from 'vitest';

import { parseNonNegativeNumber } from './number-input';

describe('parseNonNegativeNumber', () => {
  it('clamps negative, empty, and non-finite values to zero', () => {
    expect(parseNonNegativeNumber('-100')).toBe(0);
    expect(parseNonNegativeNumber('')).toBe(0);
    expect(parseNonNegativeNumber('not-a-number')).toBe(0);
    expect(parseNonNegativeNumber(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('keeps finite positive values', () => {
    expect(parseNonNegativeNumber('1234.56')).toBe(1234.56);
    expect(parseNonNegativeNumber(42)).toBe(42);
  });
});
