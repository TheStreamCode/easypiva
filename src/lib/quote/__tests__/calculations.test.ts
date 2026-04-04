import { describe, expect, it } from 'vitest';
import { calculateQuoteLineTotal, calculateQuoteTotals } from '../calculations';

describe('calculateQuoteTotals', () => {
  it('defaults an omitted quantity to 1 explicitly', () => {
    const lineTotal = calculateQuoteLineTotal({
      id: 'item-1',
      description: 'Consulenza singola',
      unitPrice: 99.99,
    });

    expect(lineTotal).toBe(99.99);
  });

  it('falls back to quantity 1 when quantity is not positive', () => {
    const lineTotal = calculateQuoteLineTotal({
      id: 'item-1',
      description: 'Consulenza singola',
      quantity: 0,
      unitPrice: 99.99,
    });

    expect(lineTotal).toBe(99.99);
  });

  it('falls back to quantity 1 when quantity is not finite', () => {
    const lineTotal = calculateQuoteLineTotal({
      id: 'item-1',
      description: 'Consulenza singola',
      quantity: Number.NaN,
      unitPrice: 99.99,
    });

    expect(lineTotal).toBe(99.99);
  });

  it('supports fractional quantity values', () => {
    const lineTotal = calculateQuoteLineTotal({
      id: 'item-1',
      description: 'Supporto orario',
      quantity: 1.5,
      unitPrice: 80,
    });

    expect(lineTotal).toBe(120);
  });

  it('treats invalid unit prices as zero', () => {
    const negativeLineTotal = calculateQuoteLineTotal({
      id: 'item-1',
      description: 'Voce errata',
      quantity: 2,
      unitPrice: -50,
    });

    const nonFiniteLineTotal = calculateQuoteLineTotal({
      id: 'item-2',
      description: 'Voce errata',
      quantity: 2,
      unitPrice: Number.POSITIVE_INFINITY,
    });

    expect(negativeLineTotal).toBe(0);
    expect(nonFiniteLineTotal).toBe(0);
  });

  it('keeps cent-based totals precise', () => {
    const result = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Consulenza rapida',
          unitPrice: 0.1,
        },
        {
          id: 'item-2',
          description: 'Rettifica documento',
          unitPrice: 0.2,
        },
      ],
      discount: 0,
      vatMode: 'none',
    });

    expect(result.subtotal).toBe(0.3);
    expect(result.taxableAmount).toBe(0.3);
    expect(result.total).toBe(0.3);
  });

  it('calculates totals without VAT', () => {
    const result = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Sviluppo landing page',
          unitPrice: 1200,
        },
        {
          id: 'item-2',
          description: 'Copywriting CTA',
          quantity: 2,
          unitPrice: 150,
        },
      ],
      discount: 0,
      vatMode: 'none',
    });

    expect(result.subtotal).toBe(1500);
    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(1500);
    expect(result.vatRate).toBe(0);
    expect(result.vatAmount).toBe(0);
    expect(result.total).toBe(1500);
  });

  it('applies VAT 10 percent after the taxable amount', () => {
    const result = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Audit fiscale operativo',
          quantity: 3,
          unitPrice: 200,
        },
      ],
      discount: 0,
      vatMode: 'vat10',
    });

    expect(result.subtotal).toBe(600);
    expect(result.taxableAmount).toBe(600);
    expect(result.vatRate).toBe(0.1);
    expect(result.vatAmount).toBe(60);
    expect(result.total).toBe(660);
  });

  it('applies the global discount before VAT', () => {
    const result = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Progettazione brand kit',
          quantity: 2,
          unitPrice: 500,
        },
      ],
      discount: 0.15,
      vatMode: 'vat22',
    });

    expect(result.subtotal).toBe(1000);
    expect(result.discountAmount).toBe(150);
    expect(result.taxableAmount).toBe(850);
    expect(result.vatRate).toBe(0.22);
    expect(result.vatAmount).toBe(187);
    expect(result.total).toBe(1037);
  });

  it('clamps a negative discount to zero', () => {
    const result = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Pacchetto base',
          quantity: 1,
          unitPrice: 100,
        },
      ],
      discount: -0.2,
      vatMode: 'none',
    });

    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(100);
    expect(result.total).toBe(100);
  });

  it('caps the discount at 100 percent', () => {
    const result = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Pacchetto premium',
          quantity: 1,
          unitPrice: 100,
        },
      ],
      discount: 1.5,
      vatMode: 'vat22',
    });

    expect(result.discountAmount).toBe(100);
    expect(result.taxableAmount).toBe(0);
    expect(result.vatAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('treats discount as a fractional rate and resets non-finite values to zero', () => {
    const discountedResult = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Pacchetto intermedio',
          quantity: 1,
          unitPrice: 200,
        },
      ],
      discount: 0.25,
      vatMode: 'none',
    });

    const invalidDiscountResult = calculateQuoteTotals({
      items: [
        {
          id: 'item-1',
          description: 'Pacchetto intermedio',
          quantity: 1,
          unitPrice: 200,
        },
      ],
      discount: Number.NaN,
      vatMode: 'none',
    });

    expect(discountedResult.discountAmount).toBe(50);
    expect(discountedResult.total).toBe(150);
    expect(invalidDiscountResult.discountAmount).toBe(0);
    expect(invalidDiscountResult.total).toBe(200);
  });
});
