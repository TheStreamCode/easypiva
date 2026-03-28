export function formatCurrency(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
