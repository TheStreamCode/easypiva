import { DISPLAY_CURRENCY_DECIMALS } from './fiscal/rounding';

export function formatCurrency(value: number, maximumFractionDigits = DISPLAY_CURRENCY_DECIMALS) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits,
  }).format(value);
}
