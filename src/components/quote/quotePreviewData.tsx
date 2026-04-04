import { formatCurrency } from '@/lib/format';
import {
  calculateQuoteLineTotal,
  calculateQuoteTotals,
  getQuoteVatRate,
} from '@/lib/quote/calculations';
import { paginateQuoteBlocks, type QuotePaginationBlock } from '@/lib/quote/pagination';
import type { Quote, QuoteLineItem } from '@/lib/quote/types';

import {
  countWrappedLines,
  estimateFieldsCardHeight,
  estimatePartyCardHeight,
  estimateSimpleCardHeight,
  wrapTextLines,
} from './quotePreviewLayout';

type QuoteDraftItem = QuoteLineItem & {
  unit?: string;
};

export type QuoteDraft = Omit<Quote, 'items'> & {
  items: QuoteDraftItem[];
};

type ItemLayout = {
  item: QuoteDraftItem;
  quantity: number;
  unit: string;
  lineTotal: number;
  segmentTexts: string[];
  descriptionContinuationHeights?: number[];
};

type SplitTextMeta = {
  lines: string[];
  lineHeight: number;
};

const PAGE_HEIGHT = 297;
const FOOTER_HEIGHT = 16;
const ITEMS_HEADER_HEIGHT = 10;
const ITEM_BASE_HEIGHT = 9;
const ITEM_LINE_HEIGHT = 4.8;
const ITEM_DESCRIPTION_CHARS = 56;
const TEXT_BLOCK_LINE_HEIGHT = 4.6;
const TEXT_BLOCK_CHARS = 104;
const DEFAULT_ITEM_UNIT = 'cad';
const HEADER_TITLE_CHARS = 34;
const PARTY_LINE_CHARS = 38;
const FIELD_VALUE_CHARS = 30;
const TOTALS_LABEL_CHARS = 26;

export function formatQuoteDate(value: string) {
  if (!value) return '-';

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (isoDateMatch) {
    const [, yearText, monthText, dayText] = isoDateMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    if (
      utcDate.getUTCFullYear() === year &&
      utcDate.getUTCMonth() === month - 1 &&
      utcDate.getUTCDate() === day
    ) {
      return `${dayText}/${monthText}/${yearText}`;
    }
  }

  return value;
}

export function getProviderLines(quote: QuoteDraft) {
  return [
    quote.provider.address,
    quote.provider.city,
    quote.provider.vatNumber ? `P. IVA ${quote.provider.vatNumber}` : '',
    quote.provider.taxCode ? `CF ${quote.provider.taxCode}` : '',
    quote.provider.email ?? '',
  ].filter(Boolean);
}

export function getClientLines(quote: QuoteDraft) {
  return [
    quote.client.address,
    quote.client.city,
    quote.client.vatNumber ? `P. IVA ${quote.client.vatNumber}` : '',
    quote.client.taxCode ? `CF ${quote.client.taxCode}` : '',
    quote.client.email ?? '',
  ].filter(Boolean);
}

export function getMetaPrimaryValues(quote: QuoteDraft) {
  return [quote.title, quote.offerValidity || '-'];
}

export function getMetaReferenceValues(quote: QuoteDraft) {
  return [quote.quoteNumber, formatQuoteDate(quote.issueDate), getVatLabel(quote.vatMode)];
}

function estimateHeaderHeight(quote: QuoteDraft) {
  const providerLines = getProviderLines(quote);
  const titleLines = countWrappedLines(quote.title, HEADER_TITLE_CHARS);
  const providerHeight = estimatePartyCardHeight(
    quote.provider.name,
    providerLines,
    PARTY_LINE_CHARS,
  );
  const rightCardHeight = estimateSimpleCardHeight(['Preventivo professionale'], FIELD_VALUE_CHARS);

  return Math.max(6 + titleLines * 6 + 3 + providerHeight, rightCardHeight) + 6;
}

function estimateClientHeight(quote: QuoteDraft) {
  return estimatePartyCardHeight(quote.client.name, getClientLines(quote), PARTY_LINE_CHARS);
}

function estimateMetaHeight(quote: QuoteDraft) {
  return (
    Math.max(
      estimateFieldsCardHeight(getMetaPrimaryValues(quote), FIELD_VALUE_CHARS),
      estimateFieldsCardHeight(getMetaReferenceValues(quote), FIELD_VALUE_CHARS),
    ) + 2
  );
}

function estimateTotalsHeight(quote: QuoteDraft, totals: ReturnType<typeof calculateQuoteTotals>) {
  const summaryValues = [
    formatCurrency(totals.subtotal, 2),
    formatCurrency(totals.discountAmount, 2),
    `${getVatLabel(quote.vatMode)} ${formatCurrency(totals.vatAmount, 2)}`,
    formatCurrency(totals.total, 2),
  ];

  return estimateFieldsCardHeight(summaryValues, TOTALS_LABEL_CHARS) + 2;
}

function buildItemLayout(item: QuoteDraftItem): ItemLayout {
  const quantity =
    Number.isFinite(item.quantity) && item.quantity && item.quantity > 0 ? item.quantity : 1;
  const unit = item.unit?.trim() || DEFAULT_ITEM_UNIT;
  const lineTotal = calculateQuoteLineTotal(item);
  const descriptionLines = wrapTextLines(item.description.trim(), ITEM_DESCRIPTION_CHARS);
  const effectiveLines =
    descriptionLines.length > 0 ? descriptionLines : ['Prestazione professionale'];
  const freshItemsPageCapacity = PAGE_HEIGHT - FOOTER_HEIGHT - ITEMS_HEADER_HEIGHT;
  const maxLinesPerPart = Math.max(
    1,
    Math.floor((freshItemsPageCapacity - ITEM_BASE_HEIGHT) / ITEM_LINE_HEIGHT),
  );
  const totalHeight = ITEM_BASE_HEIGHT + effectiveLines.length * ITEM_LINE_HEIGHT;

  if (totalHeight <= freshItemsPageCapacity) {
    return {
      item,
      quantity,
      unit,
      lineTotal,
      segmentTexts: [effectiveLines.join('\n')],
    };
  }

  const segmentTexts: string[] = [];
  const descriptionContinuationHeights: number[] = [];

  for (let index = 0; index < effectiveLines.length; index += maxLinesPerPart) {
    const segmentLines = effectiveLines.slice(index, index + maxLinesPerPart);
    segmentTexts.push(segmentLines.join('\n'));
    descriptionContinuationHeights.push(ITEM_BASE_HEIGHT + segmentLines.length * ITEM_LINE_HEIGHT);
  }

  return {
    item,
    quantity,
    unit,
    lineTotal,
    segmentTexts,
    descriptionContinuationHeights,
  };
}

function buildSplitTextMeta(text: string) {
  const lines = wrapTextLines(text.trim(), TEXT_BLOCK_CHARS);
  return { lines, lineHeight: TEXT_BLOCK_LINE_HEIGHT } satisfies SplitTextMeta;
}

function getSplitBlockHeight(meta: SplitTextMeta) {
  return meta.lines.length * meta.lineHeight;
}

function buildDisclaimerText(quote: QuoteDraft) {
  const parts = [
    quote.vatExemptionReason,
    'Il presente documento ha natura di preventivo economico e non costituisce fattura.',
    'Le lavorazioni si intendono avviate dopo conferma scritta e ricezione di eventuali materiali necessari.',
  ].filter(Boolean);

  return parts.join('\n\n');
}

function buildPaymentSummary(quote: QuoteDraft) {
  const paymentLines = [
    quote.deliveryTiming ? `Tempistiche: ${quote.deliveryTiming}` : '',
    quote.paymentDetails.instructions ? `Condizioni: ${quote.paymentDetails.instructions}` : '',
    quote.paymentDetails.beneficiary ? `Beneficiario: ${quote.paymentDetails.beneficiary}` : '',
    quote.paymentDetails.bankName ? `Banca: ${quote.paymentDetails.bankName}` : '',
    quote.paymentDetails.iban ? `IBAN: ${quote.paymentDetails.iban}` : '',
    quote.causale ? `Causale: ${quote.causale}` : '',
  ].filter(Boolean);

  return paymentLines.join('\n');
}

function hasPaymentSectionContent(quote: QuoteDraft) {
  return Boolean(
    quote.deliveryTiming ||
    quote.paymentDetails.instructions ||
    quote.paymentDetails.beneficiary ||
    quote.paymentDetails.bankName ||
    quote.paymentDetails.iban ||
    quote.causale,
  );
}

export function buildPaginationData(quote: QuoteDraft) {
  const itemLayouts = new Map<string, ItemLayout>();
  const notesMeta = buildSplitTextMeta(quote.notes);
  const disclaimerMeta = buildSplitTextMeta(buildDisclaimerText(quote));
  const paymentMeta = buildSplitTextMeta(buildPaymentSummary(quote));
  const totals = calculateQuoteTotals({
    items: quote.items,
    discount: quote.discount,
    vatMode: quote.vatMode,
  });

  const blocks: QuotePaginationBlock[] = [
    { id: 'header', kind: 'header', height: estimateHeaderHeight(quote) },
    { id: 'client', kind: 'client', height: estimateClientHeight(quote) },
    { id: 'meta', kind: 'meta', height: estimateMetaHeight(quote) },
    { id: 'items-header', kind: 'items-header', height: ITEMS_HEADER_HEIGHT },
  ];

  quote.items.forEach((item, index) => {
    const layout = buildItemLayout(item);
    itemLayouts.set(item.id, layout);

    blocks.push({
      id: `item-row-${index + 1}`,
      sourceId: item.id,
      kind: 'item-row',
      height: layout.descriptionContinuationHeights
        ? layout.descriptionContinuationHeights.reduce((sum, value) => sum + value, 0)
        : ITEM_BASE_HEIGHT + layout.segmentTexts[0].split('\n').length * ITEM_LINE_HEIGHT,
      descriptionContinuationHeights: layout.descriptionContinuationHeights,
    });
  });

  if (notesMeta.lines.length > 0) {
    blocks.push({
      id: 'notes',
      kind: 'notes',
      height: getSplitBlockHeight(notesMeta),
      splitHeights: notesMeta.lines.map(() => notesMeta.lineHeight),
    });
  }

  if (hasPaymentSectionContent(quote) && paymentMeta.lines.length > 0) {
    blocks.push({
      id: 'payment',
      kind: 'notes',
      height: getSplitBlockHeight(paymentMeta),
      splitHeights: paymentMeta.lines.map(() => paymentMeta.lineHeight),
      sourceId: 'payment',
    });
  }

  blocks.push({
    id: 'totals',
    kind: 'totals',
    height: estimateTotalsHeight(quote, totals),
  });

  if (disclaimerMeta.lines.length > 0) {
    blocks.push({
      id: 'disclaimer',
      kind: 'disclaimer',
      height: getSplitBlockHeight(disclaimerMeta),
      splitHeights: disclaimerMeta.lines.map(() => disclaimerMeta.lineHeight),
    });
  }

  const pages = paginateQuoteBlocks({
    pageHeight: PAGE_HEIGHT,
    footerBlock: { id: 'document-footer', kind: 'footer', height: FOOTER_HEIGHT },
    blocks,
  });

  return {
    pages,
    itemLayouts,
    splitText: { notes: notesMeta, payment: paymentMeta, disclaimer: disclaimerMeta },
    totals,
  };
}

export function buildSplitTextLookup(
  pages: ReturnType<typeof buildPaginationData>['pages'],
  splitTextMap: Record<string, SplitTextMeta>,
) {
  const offsets = new Map<string, number>();
  const textByBlockId = new Map<string, string>();

  pages.forEach((page) => {
    page.blocks.forEach((block) => {
      const sourceId = block.sourceId ?? block.id;
      const meta = splitTextMap[sourceId];

      if (!meta || (block.kind !== 'notes' && block.kind !== 'disclaimer')) {
        return;
      }

      const currentOffset = offsets.get(sourceId) ?? 0;
      const linesToConsume = Math.max(1, Math.round(block.height / meta.lineHeight));
      const nextOffset = currentOffset + linesToConsume;
      const lines = meta.lines.slice(currentOffset, nextOffset);

      offsets.set(sourceId, nextOffset);
      textByBlockId.set(block.id, lines.join('\n'));
    });
  });

  return textByBlockId;
}

export function getVatLabel(vatMode: QuoteDraft['vatMode']) {
  return vatMode === 'none'
    ? 'Operazione non soggetta a IVA'
    : `IVA ${Math.round(getQuoteVatRate(vatMode) * 100)}%`;
}
