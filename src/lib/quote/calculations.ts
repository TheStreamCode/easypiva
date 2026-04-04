import {
  DEFAULT_QUOTE_ITEM_QUANTITY,
  QUOTE_MONEY_SCALE,
  type QuoteLineItem,
  type QuoteTotals,
  type QuoteTotalsInput,
  type QuoteVatMode,
} from './types';

const VAT_RATES: Record<QuoteVatMode, number> = {
  none: 0,
  vat10: 0.1,
  vat22: 0.22,
};

function normalizeQuoteMoney(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.round(value * QUOTE_MONEY_SCALE) / QUOTE_MONEY_SCALE;
}

function normalizeQuoteDiscount(discount: number) {
  if (!Number.isFinite(discount) || discount <= 0) {
    return 0;
  }

  if (discount >= 1) {
    return 1;
  }

  return normalizeQuoteMoney(discount);
}

function normalizeQuoteQuantity(quantity?: number) {
  if (!Number.isFinite(quantity) || quantity === undefined || quantity <= 0) {
    return DEFAULT_QUOTE_ITEM_QUANTITY;
  }

  return normalizeQuoteMoney(quantity);
}

function addMoney(left: number, right: number) {
  return normalizeQuoteMoney(left + right);
}

function multiplyMoney(left: number, right: number) {
  return normalizeQuoteMoney(left * right);
}

export function calculateQuoteLineTotal(item: QuoteLineItem) {
  const quantity = normalizeQuoteQuantity(item.quantity);
  const unitPrice = normalizeQuoteMoney(item.unitPrice);

  return multiplyMoney(quantity, unitPrice);
}

export function getQuoteVatRate(vatMode: QuoteVatMode) {
  return VAT_RATES[vatMode];
}

export function calculateQuoteTotals(input: QuoteTotalsInput): QuoteTotals {
  const discount = normalizeQuoteDiscount(input.discount);
  const subtotal = input.items.reduce(
    (sum, item) => addMoney(sum, calculateQuoteLineTotal(item)),
    0,
  );
  const discountAmount = multiplyMoney(subtotal, discount);
  const taxableAmount = addMoney(subtotal, -discountAmount);
  const vatRate = getQuoteVatRate(input.vatMode);
  const vatAmount = multiplyMoney(taxableAmount, vatRate);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    vatRate,
    vatAmount,
    total: addMoney(taxableAmount, vatAmount),
  };
}
