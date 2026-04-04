import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { RefObject } from 'react';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CAPTURE_SCALE = 2;

type ContainerInput = HTMLElement | RefObject<HTMLElement | null> | string;

function resolveContainer(input: ContainerInput): HTMLElement {
  if (typeof input === 'string') {
    const el = document.querySelector(input) as HTMLElement | null;
    if (!el) throw new Error(`exportQuoteToPdf: element not found for selector "${input}"`);
    return el;
  }
  if (input instanceof HTMLElement) return input;
  const el = input.current;
  if (!el) throw new Error('exportQuoteToPdf: container ref is null');
  return el;
}

async function waitForPreviewReady(): Promise<void> {
  await Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise<void>((resolve) => setTimeout(resolve, 100)),
  ]);

  const images = Array.from(document.querySelectorAll('.quote-a4-page img'));
  await Promise.all(
    images.map((img) => {
      const el = img as HTMLImageElement;
      if (el.complete && el.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        el.addEventListener('load', () => resolve(), { once: true });
        el.addEventListener('error', () => resolve(), { once: true });
        setTimeout(() => resolve(), 3000);
      });
    }),
  );
}

export type ExportPdfOptions = {
  filename?: string;
};

function captureContainerStyle(root: HTMLElement) {
  const rect = root.getBoundingClientRect();

  return {
    width: rect.width || root.offsetWidth || 0,
    height: rect.height || root.offsetHeight || 0,
  };
}

function buildSearchablePageText(page: HTMLElement) {
  return (page.innerText || page.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 8000);
}

export async function exportQuoteToPdf(
  container: ContainerInput,
  options?: ExportPdfOptions,
): Promise<void> {
  const root = resolveContainer(container);
  const filename = options?.filename ?? 'preventivo.pdf';

  await waitForPreviewReady();

  const pages = Array.from(root.querySelectorAll<HTMLElement>('.quote-a4-page'));
  if (pages.length === 0) throw new Error('exportQuoteToPdf: no preview pages found');

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage([A4_WIDTH_MM, A4_HEIGHT_MM], 'portrait');

    const { width, height } = captureContainerStyle(pages[i]);
    const searchableText = buildSearchablePageText(pages[i]);

    if (searchableText) {
      pdf.text(searchableText, -1000, -1000, { maxWidth: A4_WIDTH_MM - 20 });
    }

    const canvas = await html2canvas(pages[i], {
      scale: CAPTURE_SCALE,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width,
      height,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: width,
      windowHeight: height,
      onclone: (clonedDoc) => {
        const clonedRoot = clonedDoc.getElementById('quote-export-root');
        if (clonedRoot) {
          clonedRoot.style.opacity = '1';
          clonedRoot.style.left = '0';
        }

        clonedDoc.documentElement.style.backgroundColor = '#ffffff';
        clonedDoc.body.style.backgroundColor = '#ffffff';

        const style = clonedDoc.createElement('style');
        style.textContent = `
          html,
          body {
            background: #ffffff !important;
            color: #18181b !important;
          }

          #quote-export-root,
          #quote-export-root * {
            color: #18181b !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          #quote-export-root,
          #quote-export-root .quote-a4-page,
          #quote-export-root .quote-a4-page > div,
          #quote-export-root .quote-a4-content,
          #quote-export-root .quote-a4-content * {
            background-color: #ffffff !important;
          }

          #quote-export-root .quote-a4-page,
          #quote-export-root .quote-a4-page * {
            border-color: #d4d4d8 !important;
          }

          #quote-export-root .quote-a4-page img {
            background-color: transparent !important;
          }

          #quote-export-root .quote-a4-footer {
            color: #71717a !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
  }

  pdf.save(filename);
}
