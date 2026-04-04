import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { quotePlaceholder } from '@/lib/quote/placeholders';
import type { QuoteVatMode } from '@/lib/quote/types';
import { Plus, Trash2, Upload } from 'lucide-react';
import type { QuoteFormValues } from './quoteFormSchema';

export type { QuoteFormValues } from './quoteFormSchema';

const VAT_MODE_OPTIONS: Array<{ value: QuoteVatMode; label: string }> = [
  { value: 'none', label: 'Nessuna IVA' },
  { value: 'vat10', label: 'IVA 10%' },
  { value: 'vat22', label: 'IVA 22%' },
];

function createItemId(counter: { current: number }) {
  counter.current += 1;
  return `item-new-${counter.current}`;
}

function FormField({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function QuoteForm({
  onSubmit,
  onExport,
  onExportStateChange,
  isExporting = false,
}: {
  onSubmit?: (data: QuoteFormValues) => void;
  onExport?: () => void;
  onExportStateChange?: (state: { isExporting: boolean }) => void;
  isExporting?: boolean;
}) {
  const {
    register,
    watch,
    setValue,
    handleSubmit: rhfHandleSubmit,
    formState,
  } = useFormContext<QuoteFormValues>();
  const { fields, append, remove } = useFieldArray<QuoteFormValues>({ name: 'lineItems' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemIdRef = useRef(100);

  const vatMode = watch('vatMode') as QuoteVatMode;
  const logoDataUrl = watch('logoDataUrl');
  const showVatExemption = vatMode === 'none';
  const errors = formState.errors;

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setValue('logoDataUrl', result, { shouldValidate: false });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setValue('logoDataUrl', '', { shouldValidate: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmitValidated = (values: QuoteFormValues) => {
    onExportStateChange?.({ isExporting: true });
    onSubmit?.(values);
  };

  const sanitizeNumber = (raw: string): number => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const p = quotePlaceholder;

  return (
    <form onSubmit={rhfHandleSubmit(onSubmitValidated)} className="space-y-8">
      {/* Business Details */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Dati Fornitore
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            id="providerName"
            label="Ragione Sociale"
            required
            error={errors.providerName?.message}
          >
            <Input id="providerName" placeholder={p.provider.name} {...register('providerName')} />
          </FormField>
          <FormField
            id="providerEmail"
            label="Email"
            required
            error={errors.providerEmail?.message}
          >
            <Input
              id="providerEmail"
              type="email"
              placeholder={p.provider.email}
              {...register('providerEmail')}
            />
          </FormField>
          <FormField
            id="providerAddress"
            label="Indirizzo"
            required
            error={errors.providerAddress?.message}
          >
            <Input
              id="providerAddress"
              placeholder={p.provider.address}
              {...register('providerAddress')}
            />
          </FormField>
          <FormField id="providerCity" label="Citta" required error={errors.providerCity?.message}>
            <Input id="providerCity" placeholder={p.provider.city} {...register('providerCity')} />
          </FormField>
          <FormField
            id="providerVatNumber"
            label="P. IVA"
            required
            error={errors.providerVatNumber?.message}
          >
            <Input
              id="providerVatNumber"
              placeholder={p.provider.vatNumber}
              {...register('providerVatNumber')}
            />
          </FormField>
          <FormField
            id="providerTaxCode"
            label="Codice Fiscale"
            error={errors.providerTaxCode?.message}
          >
            <Input
              id="providerTaxCode"
              placeholder={p.provider.taxCode}
              {...register('providerTaxCode')}
            />
          </FormField>
          <FormField id="providerPhone" label="Telefono">
            <Input
              id="providerPhone"
              placeholder={p.provider.phone}
              {...register('providerPhone')}
            />
          </FormField>
          <FormField id="providerWebsite" label="Sito web">
            <Input
              id="providerWebsite"
              placeholder={p.provider.website}
              {...register('providerWebsite')}
            />
          </FormField>
        </div>
        {/* Logo Upload */}
        <div className="space-y-1.5">
          <Label>Logo</Label>
          <div className="flex items-center gap-3">
            {logoDataUrl ? (
              <div className="flex items-center gap-3">
                <div className="h-12 w-24 overflow-hidden rounded border border-zinc-200 bg-white">
                  <img
                    src={logoDataUrl}
                    alt="Logo aziendale"
                    className="h-full w-full object-contain"
                  />
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={handleRemoveLogo}>
                  Rimuovi
                </Button>
              </div>
            ) : null}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100">
              <Upload className="h-4 w-4" />
              Carica logo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Logo aziendale"
                onChange={handleLogoUpload}
              />
            </label>
          </div>
        </div>
      </fieldset>

      {/* Client Details */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Dati Cliente
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            id="clientName"
            label="Nome Cliente"
            required
            error={errors.clientName?.message}
          >
            <Input id="clientName" placeholder={p.client.name} {...register('clientName')} />
          </FormField>
          <FormField id="clientEmail" label="Email" required error={errors.clientEmail?.message}>
            <Input
              id="clientEmail"
              type="email"
              placeholder={p.client.email}
              {...register('clientEmail')}
            />
          </FormField>
          <FormField
            id="clientAddress"
            label="Indirizzo Cliente"
            required
            error={errors.clientAddress?.message}
          >
            <Input
              id="clientAddress"
              placeholder={p.client.address}
              {...register('clientAddress')}
            />
          </FormField>
          <FormField id="clientCity" label="Citta" error={errors.clientCity?.message}>
            <Input id="clientCity" placeholder={p.client.city} {...register('clientCity')} />
          </FormField>
          <FormField id="clientVatNumber" label="P. IVA" error={errors.clientVatNumber?.message}>
            <Input
              id="clientVatNumber"
              placeholder={p.client.vatNumber}
              {...register('clientVatNumber')}
            />
          </FormField>
          <FormField
            id="clientTaxCode"
            label="Codice Fiscale"
            error={errors.clientTaxCode?.message}
          >
            <Input
              id="clientTaxCode"
              placeholder={p.client.taxCode}
              {...register('clientTaxCode')}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Quote Header */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Intestazione
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            id="quoteNumber"
            label="Numero Preventivo"
            required
            error={errors.quoteNumber?.message}
          >
            <Input id="quoteNumber" placeholder={p.quoteNumber} {...register('quoteNumber')} />
          </FormField>
          <FormField id="issueDate" label="Data" required error={errors.issueDate?.message}>
            <Input id="issueDate" type="date" {...register('issueDate')} />
          </FormField>
          <FormField id="title" label="Oggetto" required error={errors.title?.message}>
            <Input id="title" placeholder={p.title} {...register('title')} />
          </FormField>
        </div>
      </fieldset>

      {/* Offer Validity & Delivery */}
      <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <legend className="sr-only">Validita e Tempistiche</legend>
        <FormField
          id="offerValidity"
          label="Validita Offerta"
          error={errors.offerValidity?.message}
        >
          <Input id="offerValidity" placeholder={p.offerValidity} {...register('offerValidity')} />
        </FormField>
        <FormField
          id="deliveryTiming"
          label="Tempistiche di Consegna"
          error={errors.deliveryTiming?.message}
        >
          <Input
            id="deliveryTiming"
            placeholder={p.deliveryTiming}
            {...register('deliveryTiming')}
          />
        </FormField>
      </fieldset>

      {/* Line Items */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Voci</legend>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_80px_120px] sm:gap-2">
                <FormField
                  id={`lineItems.${index}.description`}
                  label="Descrizione"
                  required
                  error={errors.lineItems?.[index]?.description?.message}
                >
                  <Input
                    id={`lineItems.${index}.description`}
                    placeholder="Descrizione voce"
                    {...register(`lineItems.${index}.description`)}
                  />
                </FormField>
                <FormField
                  id={`lineItems.${index}.quantity`}
                  label="Qta"
                  error={errors.lineItems?.[index]?.quantity?.message}
                >
                  <Input
                    id={`lineItems.${index}.quantity`}
                    type="number"
                    step="1"
                    min="1"
                    placeholder="1"
                    {...register(`lineItems.${index}.quantity`, {
                      setValueAs: (v: string) => {
                        if (v === '' || v === undefined) return undefined;
                        const n = Number(v);
                        return Number.isFinite(n) && n > 0 ? n : undefined;
                      },
                    })}
                  />
                </FormField>
                <FormField
                  id={`lineItems.${index}.unitPrice`}
                  label="Prezzo Unitario"
                  error={errors.lineItems?.[index]?.unitPrice?.message}
                >
                  <Input
                    id={`lineItems.${index}.unitPrice`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register(`lineItems.${index}.unitPrice`, {
                      setValueAs: (v: string) => {
                        if (v === '' || v === undefined) return 0;
                        const n = Number(v);
                        return Number.isFinite(n) ? Math.max(0, n) : 0;
                      },
                    })}
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-11 w-full sm:mt-6 sm:w-auto"
                aria-label="Rimuovi voce"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Rimuovi</span>
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full sm:w-auto"
          onClick={() => {
            append({ id: createItemId(itemIdRef), description: '', quantity: 1, unitPrice: 0 });
          }}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Aggiungi voce
        </Button>
      </fieldset>

      {/* Discount & VAT */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Sconto e IVA
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="discount" label="Sconto (%)" error={errors.discount?.message}>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="0"
              value={Math.round((watch('discount') ?? 0) * 100)}
              onChange={(e) => {
                const pct = sanitizeNumber(e.target.value);
                setValue('discount', Math.max(0, Math.min(100, pct)) / 100, {
                  shouldValidate: true,
                });
              }}
            />
          </FormField>
          <FormField id="vatMode" label="Regime IVA" error={errors.vatMode?.message}>
            <Select
              value={vatMode}
              onValueChange={(val) => {
                setValue('vatMode', val as QuoteVatMode, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="vatMode" className="w-full">
                <SelectValue placeholder="Seleziona regime IVA" />
              </SelectTrigger>
              <SelectContent>
                {VAT_MODE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {showVatExemption ? (
          <FormField
            id="vatExemptionReason"
            label="Motivo Esenzione IVA"
            error={errors.vatExemptionReason?.message}
          >
            <Input
              id="vatExemptionReason"
              placeholder={p.vatExemptionReason}
              {...register('vatExemptionReason')}
            />
          </FormField>
        ) : null}
      </fieldset>

      {/* Payment Details */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Pagamento
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            id="paymentBeneficiary"
            label="Beneficiario"
            error={errors.paymentBeneficiary?.message}
          >
            <Input
              id="paymentBeneficiary"
              placeholder={p.paymentDetails.beneficiary}
              {...register('paymentBeneficiary')}
            />
          </FormField>
          <FormField id="paymentIban" label="IBAN" error={errors.paymentIban?.message}>
            <Input
              id="paymentIban"
              placeholder={p.paymentDetails.iban}
              {...register('paymentIban')}
            />
          </FormField>
          <FormField id="paymentBankName" label="Banca" error={errors.paymentBankName?.message}>
            <Input
              id="paymentBankName"
              placeholder={p.paymentDetails.bankName}
              {...register('paymentBankName')}
            />
          </FormField>
          <FormField
            id="paymentInstructions"
            label="Condizioni di Pagamento"
            error={errors.paymentInstructions?.message}
          >
            <Input
              id="paymentInstructions"
              placeholder={p.paymentDetails.instructions}
              {...register('paymentInstructions')}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Causale */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Causale</legend>
        <FormField id="causale" label="Causale" error={errors.causale?.message}>
          <Input id="causale" placeholder={p.causale} {...register('causale')} />
        </FormField>
      </fieldset>

      {/* Notes */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Note</legend>
        <FormField id="notes" label="Note" error={errors.notes?.message}>
          <textarea
            id="notes"
            className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
            placeholder={p.notes}
            {...register('notes')}
          />
        </FormField>
      </fieldset>

      {/* Disclaimer */}
      <fieldset className="space-y-4">
        <legend className="sr-only">Disclaimer</legend>
        <FormField id="disclaimer" label="Disclaimer" error={undefined}>
          <p id="disclaimer" className="text-sm text-zinc-500 dark:text-zinc-400">
            Il presente documento ha natura di preventivo economico e non costituisce fattura.
          </p>
        </FormField>
      </fieldset>

      {/* Submit */}
      <div className="flex justify-end border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <Button
          type="button"
          data-testid="quote-export-button"
          disabled={isExporting}
          onClick={onExport}
          size="lg"
          className="h-11 w-full sm:w-auto"
        >
          {isExporting ? 'Esportazione in corso...' : 'Esporta PDF'}
        </Button>
      </div>
    </form>
  );
}

export default QuoteForm;
