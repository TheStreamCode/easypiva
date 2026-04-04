import type { ReactNode } from 'react';

import type { QuotePaginationPage } from '@/lib/quote/pagination';

import { QuoteItemsTable, type QuoteItemsTableRow } from './QuoteItemsTable';
import {
  buildPaginationData,
  getClientLines,
  getProviderLines,
  type QuoteDraft,
} from './quotePreviewData';
import { PartyBlock, QuoteMetaBlock, SectionText, TotalsSummary } from './renderPageContentParts';

export function renderPageContent(
  page: QuotePaginationPage,
  quote: QuoteDraft,
  pagination: ReturnType<typeof buildPaginationData>,
  splitTextByBlockId: Map<string, string>,
) {
  const content: ReactNode[] = [];

  for (let index = 0; index < page.blocks.length; index += 1) {
    const block = page.blocks[index];

    if (block.kind === 'footer') continue;

    if (block.kind === 'header') {
      const providerLines = getProviderLines(quote);

      content.push(
        <section
          key={block.id}
          className="flex items-start justify-between gap-8 border-b border-zinc-200 pb-6"
        >
          <div className="max-w-[95mm] space-y-4">
            <div className="flex items-center gap-4">
              {quote.logoDataUrl ? (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white">
                  <img
                    src={quote.logoDataUrl}
                    alt={`Logo ${quote.provider.name}`}
                    style={{
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                  Logo
                </div>
              )}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-zinc-400">
                  Preventivo
                </p>
                <h1 className="mt-2 font-serif text-[28px] leading-none text-zinc-950">
                  {quote.title}
                </h1>
              </div>
            </div>
            <div className="space-y-1 text-[11px] leading-relaxed text-zinc-600">
              <p className="text-sm font-semibold text-zinc-950">{quote.provider.name}</p>
              {providerLines.map((line, lineIndex) => (
                <p key={`${block.id}-provider-line-${lineIndex}`}>{line}</p>
              ))}
            </div>
          </div>

          <div className="w-[58mm] rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 text-[11px] text-zinc-700">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              Documento
            </p>
            <div className="mt-3 space-y-1 leading-relaxed text-zinc-600">
              <p>Preventivo professionale</p>
            </div>
          </div>
        </section>,
      );
      continue;
    }

    if (block.kind === 'client') {
      content.push(
        <div key={block.id}>
          <PartyBlock label="Cliente" title={quote.client.name} lines={getClientLines(quote)} />
        </div>,
      );
      continue;
    }

    if (block.kind === 'meta') {
      content.push(
        <div key={block.id}>
          <QuoteMetaBlock quote={quote} />
        </div>,
      );
      continue;
    }

    if (block.kind === 'items-header') {
      const rows: QuoteItemsTableRow[] = [];
      let rowIndex = index + 1;

      while (rowIndex < page.blocks.length && page.blocks[rowIndex].kind === 'item-row') {
        const rowBlock = page.blocks[rowIndex];
        const sourceId = rowBlock.sourceId ?? rowBlock.id;
        const layout = pagination.itemLayouts.get(sourceId);

        if (layout) {
          const isContinuation = Boolean(rowBlock.continuesDescription);
          const segmentIndex = isContinuation
            ? Math.max(0, (rowBlock.continuationIndex ?? 1) - 1)
            : 0;

          rows.push({
            id: rowBlock.id,
            description: layout.segmentTexts[segmentIndex] ?? layout.segmentTexts[0],
            quantity: isContinuation ? undefined : layout.quantity,
            unit: isContinuation ? undefined : layout.unit,
            unitPrice: isContinuation ? undefined : layout.item.unitPrice,
            lineTotal: isContinuation ? undefined : layout.lineTotal,
            continuation: isContinuation,
          });
        }

        rowIndex += 1;
      }

      content.push(
        <div key={block.id}>
          <QuoteItemsTable rows={rows} showHeader repeatedHeader={Boolean(block.repeated)} />
        </div>,
      );
      index = rowIndex - 1;
      continue;
    }

    if (block.kind === 'notes' && (block.sourceId ?? block.id) === 'payment') {
      const body = splitTextByBlockId.get(block.id) ?? '';
      content.push(
        <div key={block.id}>
          <SectionText title="Condizioni e pagamento" body={body} />
        </div>,
      );
      continue;
    }

    if (block.kind === 'notes') {
      const body = splitTextByBlockId.get(block.id) ?? '';
      content.push(
        <div key={block.id}>
          <SectionText title="Note" body={body} />
        </div>,
      );
      continue;
    }

    if (block.kind === 'totals') {
      content.push(
        <div key={block.id}>
          <TotalsSummary quote={quote} totals={pagination.totals} />
        </div>,
      );
      continue;
    }

    if (block.kind === 'disclaimer') {
      const body = splitTextByBlockId.get(block.id) ?? '';
      content.push(
        <div key={block.id}>
          <SectionText title="Disclaimer" body={body} />
        </div>,
      );
    }
  }

  return content;
}
