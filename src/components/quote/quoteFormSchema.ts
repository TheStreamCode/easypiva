import { z } from 'zod';
import { isSafeLogoDataUrl } from '@/lib/quote/logo';

// Hard limits keep the A4 pagination estimates bounded and protect persisted
// drafts from content that the paginator cannot lay out on a page.
export const QUOTE_LIMITS = {
  partyField: 160,
  addressField: 200,
  cityField: 100,
  fiscalCode: 40,
  email: 160,
  phone: 40,
  website: 200,
  quoteNumber: 40,
  title: 140,
  offerValidity: 120,
  deliveryTiming: 200,
  lineItems: 50,
  itemDescription: 400,
  vatExemptionReason: 300,
  paymentBeneficiary: 160,
  paymentIban: 60,
  paymentBankName: 120,
  paymentInstructions: 400,
  causale: 300,
  notes: 4000,
} as const;

const maxMessage = (max: number) => `Massimo ${max} caratteri`;

export const quoteFormSchema = z.object({
  providerName: z
    .string()
    .min(1, 'Ragione sociale obbligatoria')
    .max(QUOTE_LIMITS.partyField, maxMessage(QUOTE_LIMITS.partyField)),
  providerAddress: z
    .string()
    .min(1, 'Indirizzo obbligatorio')
    .max(QUOTE_LIMITS.addressField, maxMessage(QUOTE_LIMITS.addressField)),
  providerCity: z
    .string()
    .min(1, 'Citta obbligatoria')
    .max(QUOTE_LIMITS.cityField, maxMessage(QUOTE_LIMITS.cityField)),
  providerVatNumber: z
    .string()
    .min(1, 'P. IVA obbligatoria')
    .max(QUOTE_LIMITS.fiscalCode, maxMessage(QUOTE_LIMITS.fiscalCode)),
  providerTaxCode: z.string().max(QUOTE_LIMITS.fiscalCode, maxMessage(QUOTE_LIMITS.fiscalCode)),
  providerEmail: z
    .string()
    .trim()
    .min(1, 'Email obbligatoria')
    .email('Email non valida')
    .max(QUOTE_LIMITS.email, maxMessage(QUOTE_LIMITS.email)),
  providerPhone: z.string().max(QUOTE_LIMITS.phone, maxMessage(QUOTE_LIMITS.phone)),
  providerWebsite: z.string().max(QUOTE_LIMITS.website, maxMessage(QUOTE_LIMITS.website)),
  clientName: z
    .string()
    .min(1, 'Nome cliente obbligatorio')
    .max(QUOTE_LIMITS.partyField, maxMessage(QUOTE_LIMITS.partyField)),
  clientAddress: z
    .string()
    .min(1, 'Indirizzo cliente obbligatorio')
    .max(QUOTE_LIMITS.addressField, maxMessage(QUOTE_LIMITS.addressField)),
  clientCity: z.string().max(QUOTE_LIMITS.cityField, maxMessage(QUOTE_LIMITS.cityField)),
  clientVatNumber: z.string().max(QUOTE_LIMITS.fiscalCode, maxMessage(QUOTE_LIMITS.fiscalCode)),
  clientTaxCode: z.string().max(QUOTE_LIMITS.fiscalCode, maxMessage(QUOTE_LIMITS.fiscalCode)),
  clientEmail: z
    .string()
    .trim()
    .min(1, 'Email cliente obbligatoria')
    .email('Email non valida')
    .max(QUOTE_LIMITS.email, maxMessage(QUOTE_LIMITS.email)),
  quoteNumber: z
    .string()
    .min(1, 'Numero preventivo obbligatorio')
    .max(QUOTE_LIMITS.quoteNumber, maxMessage(QUOTE_LIMITS.quoteNumber)),
  issueDate: z.string().min(1, 'Data obbligatoria'),
  title: z
    .string()
    .min(1, 'Oggetto obbligatorio')
    .max(QUOTE_LIMITS.title, maxMessage(QUOTE_LIMITS.title)),
  offerValidity: z.string().max(QUOTE_LIMITS.offerValidity, maxMessage(QUOTE_LIMITS.offerValidity)),
  deliveryTiming: z
    .string()
    .max(QUOTE_LIMITS.deliveryTiming, maxMessage(QUOTE_LIMITS.deliveryTiming)),
  lineItems: z
    .array(
      z.object({
        id: z.string(),
        description: z
          .string()
          .min(1, 'Descrizione obbligatoria')
          .max(QUOTE_LIMITS.itemDescription, maxMessage(QUOTE_LIMITS.itemDescription)),
        quantity: z.number().positive('Quantita deve essere positiva').optional(),
        unitPrice: z.number().min(0, 'Prezzo non negativo'),
      }),
    )
    .min(1, 'Almeno una voce')
    .max(QUOTE_LIMITS.lineItems, `Massimo ${QUOTE_LIMITS.lineItems} voci`),
  discount: z.number().min(0).max(1),
  vatMode: z.enum(['none', 'vat10', 'vat22']),
  vatExemptionReason: z
    .string()
    .max(QUOTE_LIMITS.vatExemptionReason, maxMessage(QUOTE_LIMITS.vatExemptionReason)),
  paymentBeneficiary: z
    .string()
    .max(QUOTE_LIMITS.paymentBeneficiary, maxMessage(QUOTE_LIMITS.paymentBeneficiary)),
  paymentIban: z.string().max(QUOTE_LIMITS.paymentIban, maxMessage(QUOTE_LIMITS.paymentIban)),
  paymentBankName: z
    .string()
    .max(QUOTE_LIMITS.paymentBankName, maxMessage(QUOTE_LIMITS.paymentBankName)),
  paymentInstructions: z
    .string()
    .max(QUOTE_LIMITS.paymentInstructions, maxMessage(QUOTE_LIMITS.paymentInstructions)),
  causale: z.string().max(QUOTE_LIMITS.causale, maxMessage(QUOTE_LIMITS.causale)),
  notes: z.string().max(QUOTE_LIMITS.notes, maxMessage(QUOTE_LIMITS.notes)),
  logoDataUrl: z.string().refine(isSafeLogoDataUrl, 'Formato logo non supportato'),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
