export type QuoteVatMode = 'none' | 'vat10' | 'vat22';

export const DEFAULT_QUOTE_ITEM_QUANTITY = 1;

// Quote math keeps up to 6 decimals internally to remove float noise while preserving precise totals for later UI formatting.
export const QUOTE_MONEY_SCALE = 1_000_000;

export type QuoteMoney = number;
// Fractional discount rate in the inclusive range [0, 1]. Example: 0.15 means 15%.
export type QuoteDiscount = number;

export type QuoteParty = {
  name: string;
  address: string;
  city: string;
  vatNumber?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  website?: string;
};

export type QuoteLineItem = {
  id: string;
  description: string;
  quantity?: number;
  unitPrice: QuoteMoney;
};

export type QuotePaymentDetails = {
  beneficiary: string;
  iban: string;
  bankName?: string;
  instructions: string;
};

export type Quote = {
  id: string;
  quoteNumber: string;
  title: string;
  issueDate: string;
  provider: QuoteParty;
  client: QuoteParty;
  items: QuoteLineItem[];
  discount: QuoteDiscount;
  vatMode: QuoteVatMode;
  notes: string;
  offerValidity: string;
  deliveryTiming: string;
  paymentDetails: QuotePaymentDetails;
  causale: string;
  vatExemptionReason: string;
  logoDataUrl: string;
};

export type QuoteTotalsInput = {
  items: QuoteLineItem[];
  discount: QuoteDiscount;
  vatMode: QuoteVatMode;
};

export type QuoteTotals = {
  subtotal: QuoteMoney;
  discountAmount: QuoteMoney;
  taxableAmount: QuoteMoney;
  vatRate: number;
  vatAmount: QuoteMoney;
  total: QuoteMoney;
};
