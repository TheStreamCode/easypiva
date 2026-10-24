import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Download } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { formatLocalDateInput } from '@/lib/local-date';
import { isSafeLogoDataUrl } from '@/lib/quote/logo';
import { QuoteForm, type QuoteFormValues } from '../components/quote/QuoteForm';
import { QuotePreview } from '../components/quote/QuotePreview';
import { QuoteExportPages } from '../components/quote/QuoteExportPages';
import { buildPaginationDataSafe, type QuoteDraft } from '../components/quote/quotePreviewData';
import { QUOTE_LIMITS, quoteFormSchema } from '../components/quote/quoteFormSchema';
import { readStorageItem, writeStorageItem, removeStorageItem } from '@/lib/browser-storage';

const STORAGE_KEY = 'easypiva.quote-draft';
const FORM_ID = 'quote-builder-form';

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
    issueDate: formatLocalDateInput(),
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
  const raw = readStorageItem(STORAGE_KEY);
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

function clampText(value: unknown, max: number, fallback = ''): string {
  return String(value ?? fallback).slice(0, max);
}

function sanitizeDraft(input: Partial<QuoteFormValues>): QuoteFormValues {
  const defaults = defaultFormValues();

  const safeNumber = (value: unknown, fallback: number): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const lineItems =
    Array.isArray(input.lineItems) && input.lineItems.length > 0
      ? input.lineItems.slice(0, QUOTE_LIMITS.lineItems).map((item, index) => ({
          id: String(item?.id ?? `item-${index + 1}`),
          description: clampText(item?.description, QUOTE_LIMITS.itemDescription),
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
    providerName: clampText(input.providerName, QUOTE_LIMITS.partyField, defaults.providerName),
    providerAddress: clampText(
      input.providerAddress,
      QUOTE_LIMITS.addressField,
      defaults.providerAddress,
    ),
    providerCity: clampText(input.providerCity, QUOTE_LIMITS.cityField, defaults.providerCity),
    providerVatNumber: clampText(
      input.providerVatNumber,
      QUOTE_LIMITS.fiscalCode,
      defaults.providerVatNumber,
    ),
    providerTaxCode: clampText(
      input.providerTaxCode,
      QUOTE_LIMITS.fiscalCode,
      defaults.providerTaxCode,
    ),
    providerEmail: clampText(input.providerEmail, QUOTE_LIMITS.email, defaults.providerEmail),
    providerPhone: clampText(input.providerPhone, QUOTE_LIMITS.phone, defaults.providerPhone),
    providerWebsite: clampText(
      input.providerWebsite,
      QUOTE_LIMITS.website,
      defaults.providerWebsite,
    ),
    clientName: clampText(input.clientName, QUOTE_LIMITS.partyField, defaults.clientName),
    clientAddress: clampText(
      input.clientAddress,
      QUOTE_LIMITS.addressField,
      defaults.clientAddress,
    ),
    clientCity: clampText(input.clientCity, QUOTE_LIMITS.cityField, defaults.clientCity),
    clientVatNumber: clampText(
      input.clientVatNumber,
      QUOTE_LIMITS.fiscalCode,
      defaults.clientVatNumber,
    ),
    clientTaxCode: clampText(input.clientTaxCode, QUOTE_LIMITS.fiscalCode, defaults.clientTaxCode),
    clientEmail: clampText(input.clientEmail, QUOTE_LIMITS.email, defaults.clientEmail),
    quoteNumber: clampText(input.quoteNumber, QUOTE_LIMITS.quoteNumber, defaults.quoteNumber),
    issueDate: String(input.issueDate ?? defaults.issueDate),
    title: clampText(input.title, QUOTE_LIMITS.title, defaults.title),
    offerValidity: clampText(
      input.offerValidity,
      QUOTE_LIMITS.offerValidity,
      defaults.offerValidity,
    ),
    deliveryTiming: clampText(
      input.deliveryTiming,
      QUOTE_LIMITS.deliveryTiming,
      defaults.deliveryTiming,
    ),
    lineItems,
    discount: safeNumber(input.discount, 0),
    vatMode: (['none', 'vat10', 'vat22'].includes(input.vatMode as string)
      ? input.vatMode
      : defaults.vatMode) as QuoteFormValues['vatMode'],
    vatExemptionReason: clampText(
      input.vatExemptionReason,
      QUOTE_LIMITS.vatExemptionReason,
      defaults.vatExemptionReason,
    ),
    paymentBeneficiary: clampText(
      input.paymentBeneficiary,
      QUOTE_LIMITS.paymentBeneficiary,
      defaults.paymentBeneficiary,
    ),
    paymentIban: clampText(input.paymentIban, QUOTE_LIMITS.paymentIban, defaults.paymentIban),
    paymentBankName: clampText(
      input.paymentBankName,
      QUOTE_LIMITS.paymentBankName,
      defaults.paymentBankName,
    ),
    paymentInstructions: clampText(
      input.paymentInstructions,
      QUOTE_LIMITS.paymentInstructions,
      defaults.paymentInstructions,
    ),
    causale: clampText(input.causale, QUOTE_LIMITS.causale, defaults.causale),
    notes: clampText(input.notes, QUOTE_LIMITS.notes, defaults.notes),
    logoDataUrl: isSafeLogoDataUrl(String(input.logoDataUrl ?? ''))
      ? String(input.logoDataUrl ?? '')
      : defaults.logoDataUrl,
  };
}

function formValuesToDraft(values: QuoteFormValues): QuoteDraft {
  return {
    id: 'quote-draft',
    quoteNumber: values.quoteNumber,
    title: values.title,
    issueDate: values.issueDate,
    provider: {
      name: values.providerName,
      address: values.providerAddress,
      city: values.providerCity,
      vatNumber: values.providerVatNumber,
      taxCode: values.providerTaxCode,
      email: values.providerEmail,
      phone: values.providerPhone,
      website: values.providerWebsite,
    },
    client: {
      name: values.clientName,
      address: values.clientAddress,
      city: values.clientCity,
      vatNumber: values.clientVatNumber,
      taxCode: values.clientTaxCode,
      email: values.clientEmail,
    },
    items: values.lineItems.map((item, index) => ({
      id: item.id || `item-${index + 1}`,
      description: item.description,
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

function QuoteBuilderErrorFallback({ onReset }: { onReset: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-6 dark:border-red-900/60 dark:bg-red-950/20"
    >
      <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
        Impossibile mostrare il preventivo
      </h2>
      <p className="text-sm leading-relaxed text-red-900/80 dark:text-red-200/80">
        La bozza salvata contiene dati che non possono essere impaginati. Puoi riprovare oppure
        cancellare la bozza locale e ricominciare.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onReset}>
          Riprova
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            removeStorageItem(STORAGE_KEY);
            window.location.reload();
          }}
        >
          Cancella la bozza e ricarica
        </Button>
      </div>
    </div>
  );
}

export default function QuoteBuilder() {
  const [isExporting, setIsExporting] = useState(false);
  const [hasDraftSaveError, setHasDraftSaveError] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDraftRef = useRef<unknown>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: loadDraft(),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const watchedValues = form.watch();

  // Persist draft on change (debounced)
  useEffect(() => {
    const subscription = form.watch((values) => {
      pendingDraftRef.current = values;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const didSave = writeStorageItem(STORAGE_KEY, JSON.stringify(values));
        setHasDraftSaveError(!didSave);
        pendingDraftRef.current = null;
      }, DEBOUNCE_MS);
    });

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (pendingDraftRef.current) {
        writeStorageItem(STORAGE_KEY, JSON.stringify(pendingDraftRef.current));
      }

      subscription.unsubscribe();
    };
  }, [form]);

  const quoteDraft = useMemo(() => formValuesToDraft(watchedValues), [watchedValues]);

  const handleExport = useCallback(async (values: QuoteFormValues) => {
    setIsExporting(true);
    setExportError(null);
    try {
      const draft = formValuesToDraft(values);

      if (!buildPaginationDataSafe(draft).ok) {
        setExportError(
          'Il preventivo contiene testi troppo lunghi per essere impaginato. Riduci la lunghezza di titolo, note o descrizioni e riprova.',
        );
        return;
      }

      const { exportQuoteToPdf } = await import('@/lib/quote/export-pdf');
      await exportQuoteToPdf('#quote-export-root', {
        filename: `preventivo-${draft.quoteNumber}.pdf`,
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportError('Non è stato possibile generare il PDF. Riprova tra qualche istante.');
    } finally {
      setIsExporting(false);
    }
  }, []);

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
        {hasDraftSaveError ? (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100"
          >
            Bozza non salvata: lo storage locale del browser non e disponibile o ha esaurito lo
            spazio.
          </p>
        ) : null}
        {exportError ? (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-100"
          >
            {exportError}
          </p>
        ) : null}
      </div>

      {/* Mobile actions bar — visible on all sizes, primary CTA on mobile */}
      <div
        data-testid="mobile-actions"
        className="sticky top-16 z-30 flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/90 p-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 lg:hidden"
      >
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Anteprima pronta
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button type="submit" form={FORM_ID} size="sm" disabled={isExporting}>
            <Download className="mr-1.5 h-4 w-4" />
            {isExporting ? 'Preparazione PDF...' : 'Esporta PDF'}
          </Button>
        </div>
      </div>

      <ErrorBoundary fallback={(reset) => <QuoteBuilderErrorFallback onReset={reset} />}>
        {/* Main layout — form + preview */}
        <div data-testid="quote-builder-grid" className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="min-w-0">
            <FormProvider {...form}>
              <QuoteForm formId={FORM_ID} onSubmit={handleExport} isExporting={isExporting} />
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
      </ErrorBoundary>
    </motion.div>
  );
}
