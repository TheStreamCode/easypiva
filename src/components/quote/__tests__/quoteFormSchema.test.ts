import { describe, expect, test } from 'vitest';

import { QUOTE_LIMITS, quoteFormSchema } from '../quoteFormSchema';

const validDraft = {
  providerName: 'Studio Test',
  providerAddress: 'Via Roma 1',
  providerCity: 'Milano',
  providerVatNumber: 'IT12345678901',
  providerTaxCode: '',
  providerEmail: 'info@studio.it',
  providerPhone: '',
  providerWebsite: '',
  clientName: 'Cliente Test',
  clientAddress: 'Via Milano 2',
  clientCity: '',
  clientVatNumber: '',
  clientTaxCode: '',
  clientEmail: 'cliente@test.it',
  quoteNumber: 'PREV-001',
  issueDate: '2026-10-24',
  title: 'Preventivo test',
  offerValidity: '',
  deliveryTiming: '',
  lineItems: [{ id: '1', description: 'Voce', quantity: 1, unitPrice: 100 }],
  discount: 0,
  vatMode: 'none' as const,
  vatExemptionReason: '',
  paymentBeneficiary: '',
  paymentIban: '',
  paymentBankName: '',
  paymentInstructions: '',
  causale: '',
  notes: '',
  logoDataUrl: '',
};

describe('quoteFormSchema limits', () => {
  test('accepts a valid draft', () => {
    expect(quoteFormSchema.safeParse(validDraft).success).toBe(true);
  });

  test('rejects a title longer than the A4 header limit', () => {
    const result = quoteFormSchema.safeParse({
      ...validDraft,
      title: 'X'.repeat(QUOTE_LIMITS.title + 1),
    });

    expect(result.success).toBe(false);
  });

  test('rejects too many line items', () => {
    const result = quoteFormSchema.safeParse({
      ...validDraft,
      lineItems: Array.from({ length: QUOTE_LIMITS.lineItems + 1 }, (_, index) => ({
        id: `item-${index + 1}`,
        description: 'Voce',
        quantity: 1,
        unitPrice: 10,
      })),
    });

    expect(result.success).toBe(false);
  });

  test('rejects notes longer than the paginator limit', () => {
    const result = quoteFormSchema.safeParse({
      ...validDraft,
      notes: 'N'.repeat(QUOTE_LIMITS.notes + 1),
    });

    expect(result.success).toBe(false);
  });
});
