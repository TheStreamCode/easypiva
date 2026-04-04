import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
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
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

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
    return Math.max(minScale, Math.min(maxScale, Math.min(scaleX, scaleY)));
  }, [maxScale, minScale, pageHeightMm, pageWidthMm, viewportSize.height, viewportSize.width]);

  useEffect(() => {
    setScale(fitScale);
    setPan({ x: 0, y: 0 });
  }, [fitScale]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;

    event.preventDefault();
    const nextScale = Math.max(minScale, Math.min(maxScale, scale - event.deltaY * 0.0012));
    if (nextScale === scale) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    const scaleRatio = nextScale / scale;

    setPan((current) => ({
      x: pointerX - (pointerX - current.x) * scaleRatio,
      y: pointerY - (pointerY - current.y) * scaleRatio,
    }));
    setScale(nextScale);
  };

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

    setPan({
      x: dragState.startPanX + (event.clientX - dragState.startX),
      y: dragState.startPanY + (event.clientY - dragState.startY),
    });
  };

  return (
    <div
      ref={viewportRef}
      className={cn('relative overflow-hidden touch-none overscroll-contain', className)}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => stopDragging(event.pointerId, event.currentTarget)}
      onPointerCancel={(event) => stopDragging(event.pointerId, event.currentTarget)}
      onPointerLeave={(event) => stopDragging(event.pointerId, event.currentTarget)}
      style={{ touchAction: 'none' }}
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
