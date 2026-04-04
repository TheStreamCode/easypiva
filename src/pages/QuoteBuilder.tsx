import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { QuoteForm, type QuoteFormValues } from '../components/quote/QuoteForm';
import { QuotePreview } from '../components/quote/QuotePreview';
import { QuoteExportPages } from '../components/quote/QuoteExportPages';
import type { QuoteDraft } from '../components/quote/quotePreviewData';
import { quotePlaceholder } from '@/lib/quote/placeholders';

const STORAGE_KEY = 'easypiva.quote-draft';

const DEBOUNCE_MS = 400;

function defaultFormValues(): QuoteFormValues {
  return {
    providerName: '',
    providerAddress: '',
    providerCity: '',
    providerVatNumber: '',
    providerTaxCode: '',
    providerEmail: '',
    providerPhone: '',
    providerWebsite: '',
    clientName: '',
    clientAddress: '',
    clientCity: '',
    clientVatNumber: '',
    clientTaxCode: '',
    clientEmail: '',
    quoteNumber: '',
    issueDate: new Date().toISOString().slice(0, 10),
    title: '',
    offerValidity: '',
    deliveryTiming: '',
    lineItems: [{ id: 'item-1', description: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    vatMode: 'none',
    vatExemptionReason: '',
    paymentBeneficiary: '',
    paymentIban: '',
    paymentBankName: '',
    paymentInstructions: '',
    causale: '',
    notes: '',
    logoDataUrl: '',
  };
}

function loadDraft(): QuoteFormValues {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultFormValues();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultFormValues();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<QuoteFormValues>;
    return sanitizeDraft(parsed);
  } catch {
    return defaultFormValues();
  }
}

function sanitizeDraft(input: Partial<QuoteFormValues>): QuoteFormValues {
  const defaults = defaultFormValues();

  const safeNumber = (value: unknown, fallback: number): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const lineItems =
    Array.isArray(input.lineItems) && input.lineItems.length > 0
      ? input.lineItems.map((item, index) => ({
          id: String(item?.id ?? `item-${index + 1}`),
          description: String(item?.description ?? ''),
          quantity:
            item?.quantity == null || item?.quantity === undefined
              ? undefined
              : (() => {
                  const n = Number(item.quantity);
                  return Number.isFinite(n) && n > 0 ? n : undefined;
                })(),
          unitPrice: safeNumber(item?.unitPrice, 0),
        }))
      : defaults.lineItems;

  return {
    providerName: String(input.providerName ?? defaults.providerName),
    providerAddress: String(input.providerAddress ?? defaults.providerAddress),
    providerCity: String(input.providerCity ?? defaults.providerCity),
    providerVatNumber: String(input.providerVatNumber ?? defaults.providerVatNumber),
    providerTaxCode: String(input.providerTaxCode ?? defaults.providerTaxCode),
    providerEmail: String(input.providerEmail ?? defaults.providerEmail),
    providerPhone: String(input.providerPhone ?? defaults.providerPhone),
    providerWebsite: String(input.providerWebsite ?? defaults.providerWebsite),
    clientName: String(input.clientName ?? defaults.clientName),
    clientAddress: String(input.clientAddress ?? defaults.clientAddress),
    clientCity: String(input.clientCity ?? defaults.clientCity),
    clientVatNumber: String(input.clientVatNumber ?? defaults.clientVatNumber),
    clientTaxCode: String(input.clientTaxCode ?? defaults.clientTaxCode),
    clientEmail: String(input.clientEmail ?? defaults.clientEmail),
    quoteNumber: String(input.quoteNumber ?? defaults.quoteNumber),
    issueDate: String(input.issueDate ?? defaults.issueDate),
    title: String(input.title ?? defaults.title),
    offerValidity: String(input.offerValidity ?? defaults.offerValidity),
    deliveryTiming: String(input.deliveryTiming ?? defaults.deliveryTiming),
    lineItems,
    discount: safeNumber(input.discount, 0),
    vatMode: (['none', 'vat10', 'vat22'].includes(input.vatMode as string)
      ? input.vatMode
      : defaults.vatMode) as QuoteFormValues['vatMode'],
    vatExemptionReason: String(input.vatExemptionReason ?? defaults.vatExemptionReason),
    paymentBeneficiary: String(input.paymentBeneficiary ?? defaults.paymentBeneficiary),
    paymentIban: String(input.paymentIban ?? defaults.paymentIban),
    paymentBankName: String(input.paymentBankName ?? defaults.paymentBankName),
    paymentInstructions: String(input.paymentInstructions ?? defaults.paymentInstructions),
    causale: String(input.causale ?? defaults.causale),
    notes: String(input.notes ?? defaults.notes),
    logoDataUrl: String(input.logoDataUrl ?? defaults.logoDataUrl),
  };
}

function formValuesToDraft(values: QuoteFormValues): QuoteDraft {
  const p = quotePlaceholder;

  return {
    id: p.id,
    quoteNumber: values.quoteNumber || p.quoteNumber,
    title: values.title || p.title,
    issueDate: values.issueDate || p.issueDate,
    provider: {
      name: values.providerName || p.provider.name,
      address: values.providerAddress || p.provider.address,
      city: values.providerCity || p.provider.city,
      vatNumber: values.providerVatNumber || p.provider.vatNumber,
      taxCode: values.providerTaxCode || p.provider.taxCode,
      email: values.providerEmail || p.provider.email,
      phone: values.providerPhone || p.provider.phone,
      website: values.providerWebsite || p.provider.website,
    },
    client: {
      name: values.clientName || p.client.name,
      address: values.clientAddress || p.client.address,
      city: values.clientCity || p.client.city,
      vatNumber: values.clientVatNumber || p.client.vatNumber,
      taxCode: values.clientTaxCode || p.client.taxCode,
      email: values.clientEmail || p.client.email,
    },
    items: values.lineItems.map((item, index) => ({
      id: item.id || `item-${index + 1}`,
      description: item.description || 'Prestazione professionale',
      quantity: item.quantity,
      unitPrice: Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
    })),
    discount: Number.isFinite(values.discount) ? values.discount : 0,
    vatMode: values.vatMode,
    notes: values.notes,
    offerValidity: values.offerValidity,
    deliveryTiming: values.deliveryTiming,
    paymentDetails: {
      beneficiary: values.paymentBeneficiary,
      iban: values.paymentIban,
      bankName: values.paymentBankName,
      instructions: values.paymentInstructions,
    },
    causale: values.causale,
    vatExemptionReason: values.vatExemptionReason,
    logoDataUrl: values.logoDataUrl,
  };
}

export default function QuoteBuilder() {
  const [isExporting, setIsExporting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<QuoteFormValues>({
    defaultValues: loadDraft(),
    mode: 'onChange',
  });

  const watchedValues = form.watch();

  // Persist draft on change (debounced)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
      } catch {
        // Storage full or unavailable — silent fail
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [watchedValues]);

  const quoteDraft = useMemo(() => formValuesToDraft(watchedValues), [watchedValues]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { exportQuoteToPdf } = await import('@/lib/quote/export-pdf');
      await exportQuoteToPdf('#quote-export-root', {
        filename: `preventivo-${quoteDraft.quoteNumber}.pdf`,
      });
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [quoteDraft.quoteNumber]);

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Crea Preventivo
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Compila i dati per generare un preventivo professionale. La bozza viene salvata
          automaticamente nel browser.
        </p>
      </div>

      {/* Mobile actions bar — visible on all sizes, primary CTA on mobile */}
      <div
        data-testid="mobile-actions"
        className="sticky top-0 z-30 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/90 p-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 lg:hidden"
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Anteprima pronta
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" size="sm" disabled={isExporting} onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            {isExporting ? 'Preparazione PDF...' : 'Esporta PDF'}
          </Button>
        </div>
      </div>

      {/* Main layout — form + preview */}
      <div data-testid="quote-builder-grid" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="min-w-0">
          <FormProvider {...form}>
            <QuoteForm onExport={handleExport} isExporting={isExporting} />
          </FormProvider>
        </div>

        {/* Preview */}
        <div className="min-w-0">
          <div className="sticky top-4">
            <QuotePreview quote={quoteDraft} />
          </div>
        </div>
      </div>

      {/* Hidden full-size pages for PDF export */}
      <QuoteExportPages quote={quoteDraft} />
    </motion.div>
  );
}
