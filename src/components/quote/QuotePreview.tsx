import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { QuotePage } from './QuotePage';
import { QuoteViewport } from './QuoteViewport';
import { buildPaginationData, buildSplitTextLookup, type QuoteDraft } from './quotePreviewData';
import { renderPageContent } from './renderPageContent';

const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;

export function QuotePreview({ quote }: { quote: QuoteDraft }) {
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
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const totalPages = pagination.pages.length;
  const activePage = pagination.pages[Math.min(activePageIndex, Math.max(0, totalPages - 1))];
  const activePageContent = activePage
    ? renderPageContent(activePage, quote, pagination, splitTextByBlockId)
    : [];

  useEffect(() => {
    setActivePageIndex((current) => Math.min(current, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  return (
    <div
      data-testid="quote-preview-root"
      className="group relative rounded-[28px] border border-zinc-200/70 bg-zinc-100/70 p-3 md:p-5 dark:border-zinc-800/60 dark:bg-zinc-950/30"
    >
      <Button
        type="button"
        size="lg"
        variant="secondary"
        onClick={() => setIsZoomOpen(true)}
        className="absolute right-3 top-3 z-10 h-11 px-4 opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
      >
        <Maximize2 className="mr-1.5 h-4 w-4" />
        Ingrandisci
      </Button>

      <div className="mb-3 flex items-center justify-between gap-3 pr-24">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setActivePageIndex((current) => Math.max(0, current - 1))}
            disabled={activePageIndex === 0}
            aria-label="Pagina precedente"
            className="h-11 w-11"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setActivePageIndex((current) => Math.min(totalPages - 1, current + 1))}
            disabled={activePageIndex >= totalPages - 1}
            aria-label="Pagina successiva"
            className="h-11 w-11"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <QuoteViewport
        className="quote-preview-surface h-[min(72vh,calc(100vh-14rem))] rounded-2xl bg-zinc-100 p-3"
        fitContentClassName="quote-preview-frame"
        pageWidthMm={PAGE_WIDTH}
        pageHeightMm={PAGE_HEIGHT}
        minScale={0.4}
        maxScale={1.6}
      >
        {activePage ? (
          <div className="flex h-full w-full justify-center">
            <QuotePage pageNumber={activePage.number} totalPages={totalPages}>
              <div className="flex h-full flex-col gap-[4mm]">
                {renderPageContent(activePage, quote, pagination, splitTextByBlockId)}
              </div>
            </QuotePage>
          </div>
        ) : null}
      </QuoteViewport>

      <div
        data-testid="quote-preview-page-counter"
        className="mt-3 flex items-center justify-center gap-3 text-base text-zinc-500"
      >
        <span>{activePageIndex + 1}</span>
        <span>/</span>
        <span>{totalPages}</span>
      </div>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-none p-4 sm:w-[calc(100vw-2rem)] sm:max-w-none lg:w-[92vw] xl:w-[85vw]">
          <DialogHeader>
            <DialogTitle>Anteprima preventivo</DialogTitle>
          </DialogHeader>
          <QuoteViewport
            className="quote-preview-surface h-[min(78vh,calc(100vh-10rem))] rounded-2xl bg-zinc-100 p-3"
            fitContentClassName="quote-preview-frame"
            pageWidthMm={PAGE_WIDTH}
            pageHeightMm={PAGE_HEIGHT}
            minScale={0.4}
            maxScale={1.8}
          >
            {activePage ? (
              <div className="flex h-full w-full justify-center">
                <QuotePage pageNumber={activePage.number} totalPages={totalPages}>
                  <div className="flex h-full flex-col gap-[4mm]">{activePageContent}</div>
                </QuotePage>
              </div>
            ) : null}
          </QuoteViewport>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuotePreview;
