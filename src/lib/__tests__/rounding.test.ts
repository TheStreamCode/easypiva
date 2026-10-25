import { describe, expect, test } from 'vitest';

import { CURRENT_PROFILE } from '../fiscal';
import {
  DISPLAY_CURRENCY_DECIMALS,
  QUOTE_COMPUTATION_DECIMALS,
  QUOTE_MONEY_SCALE,
} from '../fiscal/rounding';
import { formatCurrency } from '../format';
import { QUOTE_MONEY_SCALE as QUOTE_MONEY_SCALE_REEXPORTED } from '../quote/types';

describe('rounding rules', () => {
  test('are declared in the active fiscal profile', () => {
    expect(CURRENT_PROFILE.rounding.currencyDecimals).toBe(DISPLAY_CURRENCY_DECIMALS);
    expect(CURRENT_PROFILE.rounding.quoteComputationDecimals).toBe(QUOTE_COMPUTATION_DECIMALS);
  });

  test('drive the shared currency formatting and quote scale', () => {
    expect(formatCurrency(1.4)).toBe('1\u00a0€');
    expect(QUOTE_MONEY_SCALE).toBe(10 ** QUOTE_COMPUTATION_DECIMALS);
    expect(QUOTE_MONEY_SCALE_REEXPORTED).toBe(QUOTE_MONEY_SCALE);
  });
});
