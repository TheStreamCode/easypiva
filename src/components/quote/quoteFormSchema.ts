import { z } from 'zod';

export const quoteFormSchema = z.object({
  providerName: z.string().min(1, 'Ragione sociale obbligatoria'),
  providerAddress: z.string().min(1, 'Indirizzo obbligatorio'),
  providerCity: z.string().min(1, 'Citta obbligatoria'),
  providerVatNumber: z.string().min(1, 'P. IVA obbligatoria'),
  providerTaxCode: z.string(),
  providerEmail: z.string().trim().min(1, 'Email obbligatoria').email('Email non valida'),
  providerPhone: z.string(),
  providerWebsite: z.string(),
  clientName: z.string().min(1, 'Nome cliente obbligatorio'),
  clientAddress: z.string().min(1, 'Indirizzo cliente obbligatorio'),
  clientCity: z.string(),
  clientVatNumber: z.string(),
  clientTaxCode: z.string(),
  clientEmail: z.string().trim().min(1, 'Email cliente obbligatoria').email('Email non valida'),
  quoteNumber: z.string().min(1, 'Numero preventivo obbligatorio'),
  issueDate: z.string().min(1, 'Data obbligatoria'),
  title: z.string().min(1, 'Oggetto obbligatorio'),
  offerValidity: z.string(),
  deliveryTiming: z.string(),
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
  vatExemptionReason: z.string(),
  paymentBeneficiary: z.string(),
  paymentIban: z.string(),
  paymentBankName: z.string(),
  paymentInstructions: z.string(),
  causale: z.string(),
  notes: z.string(),
  logoDataUrl: z.string(),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;
