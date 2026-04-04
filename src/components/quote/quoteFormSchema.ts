import { z } from 'zod';

export const quoteFormSchema = z.object({
  providerName: z.string().min(1, 'Ragione sociale obbligatoria'),
  providerAddress: z.string().min(1, 'Indirizzo obbligatorio'),
  providerCity: z.string().min(1, 'Citta obbligatoria'),
  providerVatNumber: z.string().min(1, 'P. IVA obbligatoria'),
  providerTaxCode: z.string().optional().default(''),
  providerEmail: z.string().email('Email non valida').min(1, 'Email obbligatoria'),
  providerPhone: z.string().optional().default(''),
  providerWebsite: z.string().optional().default(''),
  clientName: z.string().min(1, 'Nome cliente obbligatorio'),
  clientAddress: z.string().min(1, 'Indirizzo cliente obbligatorio'),
  clientCity: z.string().optional().default(''),
  clientVatNumber: z.string().optional().default(''),
  clientTaxCode: z.string().optional().default(''),
  clientEmail: z.string().email('Email non valida').min(1, 'Email cliente obbligatoria'),
  quoteNumber: z.string().min(1, 'Numero preventivo obbligatorio'),
  issueDate: z.string().min(1, 'Data obbligatoria'),
  title: z.string().min(1, 'Oggetto obbligatorio'),
  offerValidity: z.string().optional().default(''),
  deliveryTiming: z.string().optional().default(''),
  lineItems: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().min(1, 'Descrizione obbligatoria'),
        quantity: z.number().positive('Quantita deve essere positiva').optional(),
        unitPrice: z.number().min(0, 'Prezzo non negativo'),
      }),
    )
    .min(1, 'Almeno una voce'),
  discount: z.number().min(0).max(1),
  vatMode: z.enum(['none', 'vat10', 'vat22']),
  vatExemptionReason: z.string().optional().default(''),
  paymentBeneficiary: z.string().optional().default(''),
  paymentIban: z.string().optional().default(''),
  paymentBankName: z.string().optional().default(''),
  paymentInstructions: z.string().optional().default(''),
  causale: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  logoDataUrl: z.string().optional().default(''),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
