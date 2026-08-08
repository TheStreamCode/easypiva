import { describe, expect, it } from 'vitest';
import { formatLocalDateInput } from '../local-date';

describe('formatLocalDateInput', () => {
  it('uses the local calendar date instead of UTC', () => {
    const date = new Date(2026, 7, 8, 23, 59, 59);

    expect(formatLocalDateInput(date)).toBe('2026-08-08');
  });
});
