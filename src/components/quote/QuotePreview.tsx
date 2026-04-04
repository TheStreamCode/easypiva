import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { QuotePaginationPage } from '@/lib/quote/pagination';

import { QuotePage } from './QuotePage';
import { buildPaginationData, buildSplitTextLookup, type QuoteDraft } from './quotePreviewData';
import { renderPageContent } from './renderPageContent';

const PAGE_HEIGHT = 297;
const PAGE_WIDTH = 210;
const MAIN_SCALE = 0.62;
const ZOOM_SCALE = 0.88;

function PageViewport({
  page,
  totalPages,
  scale,
  children,
}: {
  page: QuotePaginationPage;
  totalPages: number;
  scale: number;
  children: ReactNode;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: `${PAGE_WIDTH * scale}mm`,
        height: `${PAGE_HEIGHT * scale}mm`,
      }}
    >
      <div
        style={{
          width: `${PAGE_WIDTH}mm`,
          height: `${PAGE_HEIGHT}mm`,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <QuotePage pageNumber={page.number} totalPages={totalPages}>
          <div className="flex h-full flex-col gap-[4mm]">{children}</div>
        </QuotePage>
      </div>
    </div>
  );
}

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
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ dragging: false, pointerId: -1, startX: 0, startScrollLeft: 0 });

  const totalPages = pagination.pages.length;
  const activePage = pagination.pages[Math.min(activePageIndex, Math.max(0, totalPages - 1))];
  const activePageContent = activePage
    ? renderPageContent(activePage, quote, pagination, splitTextByBlockId)
    : [];

  useEffect(() => {
    setActivePageIndex((current) => Math.min(current, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  const scrollToPage = (nextIndex: number) => {
    const slider = sliderRef.current;
    if (!slider || nextIndex < 0 || nextIndex >= totalPages) return;

    setActivePageIndex(nextIndex);
    slider.scrollTo({ left: slider.clientWidth * nextIndex, behavior: 'smooth' });
  };

  const handleSliderScroll = () => {
    const slider = sliderRef.current;
    if (!slider || totalPages <= 1) return;

    const nextIndex = Math.max(
      0,
      Math.min(totalPages - 1, Math.round(slider.scrollLeft / slider.clientWidth)),
    );
    if (nextIndex !== activePageIndex) {
      setActivePageIndex(nextIndex);
    }
  };

  const stopDragging = (pointerId?: number) => {
    const slider = sliderRef.current;
    const dragState = dragStateRef.current;

    if (
      dragState.dragging &&
      slider &&
      pointerId !== undefined &&
      dragState.pointerId === pointerId
    ) {
      try {
        slider.releasePointerCapture(pointerId);
      } catch {
        // ignore
      }
    }

    dragState.dragging = false;
    dragState.pointerId = -1;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    dragStateRef.current.dragging = true;
    dragStateRef.current.pointerId = event.pointerId;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startScrollLeft = slider.scrollLeft;

    try {
      slider.setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    const slider = sliderRef.current;

    if (!dragState.dragging || dragState.pointerId !== event.pointerId || !slider) return;

    slider.scrollLeft = dragState.startScrollLeft - (event.clientX - dragState.startX);
  };

  return (
    <div
      data-testid="quote-preview-root"
      className="group relative rounded-[28px] border border-zinc-200/70 bg-zinc-100/70 p-3 md:p-5 dark:border-zinc-800/60 dark:bg-zinc-950/30"
    >
      <Button
        type="button"
        size="sm"
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
            onClick={() => scrollToPage(activePageIndex - 1)}
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
            onClick={() => scrollToPage(activePageIndex + 1)}
            disabled={activePageIndex >= totalPages - 1}
            aria-label="Pagina successiva"
            className="h-11 w-11"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth select-none scrollbar-hide"
        onScroll={handleSliderScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => stopDragging()}
        onPointerCancel={() => stopDragging()}
        onPointerLeave={() => stopDragging()}
      >
        {pagination.pages.map((page) => (
          <div key={page.number} className="w-full shrink-0 snap-center px-1">
            <div className="flex w-full justify-center">
              <PageViewport page={page} totalPages={totalPages} scale={MAIN_SCALE}>
                {renderPageContent(page, quote, pagination, splitTextByBlockId)}
              </PageViewport>
            </div>
          </div>
        ))}
      </div>

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
          <div className="max-h-[85vh] overflow-auto rounded-2xl bg-zinc-100 p-4">
            <div className="flex w-full justify-center">
              {activePage ? (
                <PageViewport page={activePage} totalPages={totalPages} scale={ZOOM_SCALE}>
                  {activePageContent}
                </PageViewport>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuotePreview;
