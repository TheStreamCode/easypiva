import { formatCurrency } from '@/lib/format';
import { calculateQuoteTotals } from '@/lib/quote/calculations';

import { getVatLabel, type QuoteDraft } from './quotePreviewData';

export function PartyBlock({
  label,
  title,
  lines,
}: {
  label: string;
  title: string;
  lines: string[];
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <h3 className="mt-2 text-sm font-semibold text-zinc-950">{title}</h3>
      <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-zinc-600">
        {lines.map((line, lineIndex) => (
          <p key={`${label}-line-${lineIndex}`}>{line}</p>
        ))}
      </div>
    </section>
  );
}

export function SectionText({ title, body }: { title: string; body: string }) {
  return (
    <section className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{title}</p>
      <div className="space-y-1 whitespace-pre-wrap text-[11px] leading-relaxed text-zinc-600">
        {body}
      </div>
    </section>
  );
}

export function TotalsSummary({
  quote,
  totals,
}: {
  quote: QuoteDraft;
  totals: ReturnType<typeof calculateQuoteTotals>;
}) {
  return (
    <section className="ml-auto w-[72mm] rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-[11px] text-zinc-700">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Riepilogo</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span>Imponibile</span>
          <span className="tabular-nums">{formatCurrency(totals.subtotal, 2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Sconto</span>
          <span className="tabular-nums">-{formatCurrency(totals.discountAmount, 2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>{getVatLabel(quote.vatMode)}</span>
          <span className="tabular-nums">{formatCurrency(totals.vatAmount, 2)}</span>
        </div>
      </div>
      <div className="mt-4 border-t border-zinc-200 pt-3">
        <div className="flex items-center justify-between gap-4 text-sm font-semibold text-zinc-950">
          <span>Totale documento</span>
          <span className="tabular-nums">{formatCurrency(totals.total, 2)}</span>
        </div>
      </div>
    </section>
  );
}

export function QuoteMetaBlock({ quote }: { quote: QuoteDraft }) {
  return (
    <section className="grid grid-cols-[1.1fr_0.9fr] gap-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Meta documento
        </p>
        <div className="mt-3 grid gap-3 text-[11px] text-zinc-700">
          <div>
            <p className="text-zinc-400">Oggetto</p>
            <p className="mt-1 font-medium text-zinc-950">{quote.title}</p>
          </div>
          <div>
            <p className="text-zinc-400">Validita offerta</p>
            <p className="mt-1">{quote.offerValidity || '-'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-[11px] text-zinc-700">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Riferimenti
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span>Numero</span>
            <span className="font-medium text-zinc-950">{quote.quoteNumber}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Data</span>
            <span>{quote.issueDate}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Regime fiscale</span>
            <span className="text-right">{quote.vatMode}</span>
          </div>
        </div>
      </section>
    </section>
  );
}
