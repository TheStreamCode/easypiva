import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type QuoteViewportProps = {
  children: ReactNode;
  className?: string;
  fitContentClassName?: string;
  pageWidthMm: number;
  pageHeightMm: number;
  minScale?: number;
  maxScale?: number;
};

const MM_TO_PX = 3.7795275591;
const ORIGIN = { x: 0, y: 0 };

export function QuoteViewport({
  children,
  className,
  fitContentClassName,
  pageWidthMm,
  pageHeightMm,
  minScale = 0.35,
  maxScale = 1.8,
}: QuoteViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    dragging: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [viewState, setViewState] = useState({
    fitScale: 1,
    scale: 1,
    pan: ORIGIN,
  });

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const updateSize = () => {
      setViewportSize({ width: element.clientWidth, height: element.clientHeight });
    };

    updateSize();

    const Observer = window.ResizeObserver;
    if (!Observer) return;

    const observer = new Observer(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const fitScale = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) return 1;

    const pageWidthPx = pageWidthMm * MM_TO_PX;
    const pageHeightPx = pageHeightMm * MM_TO_PX;
    const scaleX = viewportSize.width / pageWidthPx;
    const scaleY = viewportSize.height / pageHeightPx;
    // The fit must always show the whole sheet: do not clamp it with minScale,
    // otherwise narrow screens clip the A4 horizontally.
    return Math.min(maxScale, Math.min(scaleX, scaleY));
  }, [maxScale, pageHeightMm, pageWidthMm, viewportSize.height, viewportSize.width]);

  const currentView =
    viewState.fitScale === fitScale ? viewState : { fitScale, scale: fitScale, pan: ORIGIN };
  const { scale, pan } = currentView;

  // Wheel zoom needs a non-passive listener to call preventDefault(); React
  // registers wheel handlers as passive, so attach it through the DOM.
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  const fitScaleRef = useRef(fitScale);

  useEffect(() => {
    scaleRef.current = scale;
    panRef.current = pan;
    fitScaleRef.current = fitScale;
  }, [scale, pan, fitScale]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      const currentScale = scaleRef.current;
      const currentPan = panRef.current;
      const currentFitScale = fitScaleRef.current;
      const lowerBound = Math.min(minScale, currentFitScale);
      const nextScale = Math.max(
        lowerBound,
        Math.min(maxScale, currentScale - event.deltaY * 0.0012),
      );

      if (nextScale === currentScale) return;

      const rect = element.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const scaleRatio = nextScale / currentScale;

      setViewState({
        fitScale: currentFitScale,
        scale: nextScale,
        pan: {
          x: pointerX - (pointerX - currentPan.x) * scaleRatio,
          y: pointerY - (pointerY - currentPan.y) * scaleRatio,
        },
      });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [maxScale, minScale]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragStateRef.current.dragging = true;
    dragStateRef.current.pointerId = event.pointerId;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startY = event.clientY;
    dragStateRef.current.startPanX = pan.x;
    dragStateRef.current.startPanY = pan.y;

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const stopDragging = (pointerId?: number, target?: HTMLDivElement) => {
    const dragState = dragStateRef.current;

    if (dragState.dragging && pointerId !== undefined && dragState.pointerId === pointerId) {
      try {
        target?.releasePointerCapture(pointerId);
      } catch {
        // ignore
      }
    }

    dragState.dragging = false;
    dragState.pointerId = -1;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState.dragging || dragState.pointerId !== event.pointerId) return;

    setViewState({
      fitScale,
      scale,
      pan: {
        x: dragState.startPanX + (event.clientX - dragState.startX),
        y: dragState.startPanY + (event.clientY - dragState.startY),
      },
    });
  };

  return (
    <div
      ref={viewportRef}
      className={cn('relative overflow-hidden overscroll-contain', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => stopDragging(event.pointerId, event.currentTarget)}
      onPointerCancel={(event) => stopDragging(event.pointerId, event.currentTarget)}
      onPointerLeave={(event) => stopDragging(event.pointerId, event.currentTarget)}
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      <div
        className={cn(
          'absolute left-1/2 top-1/2 origin-top-left will-change-transform',
          fitContentClassName,
        )}
        style={{
          width: `${pageWidthMm}mm`,
          height: `${pageHeightMm}mm`,
          transform: `translate(${pan.x}px, ${pan.y}px) translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default QuoteViewport;
