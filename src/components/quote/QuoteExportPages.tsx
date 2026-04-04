import { useMemo } from 'react';

import { QuotePage } from './QuotePage';
import { buildPaginationData, buildSplitTextLookup, type QuoteDraft } from './quotePreviewData';
import { renderPageContent } from './renderPageContent';

const PAGE_WIDTH = 210;

export function QuoteExportPages({ quote }: { quote: QuoteDraft }) {
  const pagination = useMemo(() => buildPaginationData(quote), [quote]);
  const splitTextByBlockId = useMemo(
    () =>
      buildSplitTextLookup(pagination.pages, {
        notes: pagination.splitText.notes,
        payment: pagination.splitText.payment,
        disclaimer: pagination.splitText.disclaimer,
      }),
    [
      pagination.pages,
      pagination.splitText.notes,
      pagination.splitText.payment,
      pagination.splitText.disclaimer,
    ],
  );

  return (
    <div
      id="quote-export-root"
      className="quote-export-container"
      style={{
        position: 'absolute',
        top: 0,
        left: '-10000px',
        width: `${PAGE_WIDTH}mm`,
        pointerEvents: 'none',
        opacity: 1,
      }}
      aria-hidden="true"
    >
      {pagination.pages.map((page) => (
        <div key={page.number} data-page-number={page.number}>
          <QuotePage pageNumber={page.number} totalPages={pagination.pages.length}>
            <div className="flex h-full flex-col gap-[4mm]">
              {renderPageContent(page, quote, pagination, splitTextByBlockId)}
            </div>
          </QuotePage>
        </div>
      ))}
    </div>
  );
}
