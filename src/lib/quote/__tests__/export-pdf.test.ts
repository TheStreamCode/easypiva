import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

const mockSave = vi.fn();
const mockAddImage = vi.fn();
const mockAddPage = vi.fn();
const mockHtml = vi.fn().mockResolvedValue(undefined);

const mockHtml2Canvas = vi.fn();

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    save: mockSave,
    addImage: mockAddImage,
    addPage: mockAddPage,
    html: mockHtml,
  })),
}));

vi.mock('html2canvas', () => ({
  default: mockHtml2Canvas,
}));

const { exportQuoteToPdf } = await import('../export-pdf');

function createPreviewRoot(pageCount: number): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-testid', 'quote-preview-root');
  for (let i = 0; i < pageCount; i++) {
    const page = document.createElement('article');
    page.className = 'quote-a4-page';
    page.style.width = '210mm';
    page.style.height = '297mm';
    root.appendChild(page);
  }
  document.body.appendChild(root);
  return root;
}

describe('exportQuoteToPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHtml2Canvas.mockImplementation(async (el: HTMLElement) => {
      const canvas = document.createElement('canvas');
      const computedW = parseInt(el.style.width, 10) || 210;
      const computedH = parseInt(el.style.height, 10) || 297;
      canvas.width = computedW * 2;
      canvas.height = computedH * 2;
      // jsdom lacks canvas; stub toDataURL so addImage doesn't throw
      canvas.toDataURL = () => 'data:image/png;base64,';
      return canvas;
    });
    document.body.innerHTML = '';
  });

  it('finds preview pages in the container element', async () => {
    createPreviewRoot(1);
    const root = document.querySelector('[data-testid="quote-preview-root"]')!;

    await exportQuoteToPdf(root as HTMLElement);

    expect(mockHtml2Canvas).toHaveBeenCalledTimes(1);
  });

  it('creates a jsPDF with A4 portrait millimetres', async () => {
    createPreviewRoot(1);
    const { jsPDF } = await import('jspdf');
    const root = document.querySelector('[data-testid="quote-preview-root"]')!;

    await exportQuoteToPdf(root as HTMLElement);

    expect(jsPDF).toHaveBeenCalledWith({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  });

  it('adds one PDF page per preview page via addImage', async () => {
    createPreviewRoot(3);
    const root = document.querySelector('[data-testid="quote-preview-root"]')!;

    await exportQuoteToPdf(root as HTMLElement);

    expect(mockHtml2Canvas).toHaveBeenCalledTimes(3);
    expect(mockAddImage).toHaveBeenCalledTimes(3);
    expect(mockAddPage).toHaveBeenCalledTimes(2);
  });

  it('uses a high capture scale for print quality', async () => {
    createPreviewRoot(1);
    const root = document.querySelector('[data-testid="quote-preview-root"]')!;

    await exportQuoteToPdf(root as HTMLElement);

    expect(mockHtml2Canvas).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ scale: 2, useCORS: true }),
    );
  });

  it('captures off-screen preview pages from the origin', async () => {
    const root = createPreviewRoot(1);
    const page = root.querySelector('.quote-a4-page') as HTMLElement;
    page.getBoundingClientRect = () =>
      ({
        width: 210,
        height: 297,
        top: 0,
        left: -10000,
        right: -9790,
        bottom: 297,
        x: -10000,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    await exportQuoteToPdf(root as HTMLElement);

    expect(mockHtml2Canvas).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ x: 0, y: 0 }),
    );
  });

  it('saves with the provided filename', async () => {
    createPreviewRoot(1);
    const root = document.querySelector('[data-testid="quote-preview-root"]')!;

    await exportQuoteToPdf(root as HTMLElement, { filename: 'test-preventivo.pdf' });

    expect(mockSave).toHaveBeenCalledWith('test-preventivo.pdf');
  });

  it('accepts a CSS selector string', async () => {
    createPreviewRoot(1);

    await exportQuoteToPdf('[data-testid="quote-preview-root"]');

    expect(mockHtml2Canvas).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalled();
  });

  it('accepts a React ref object', async () => {
    const root = createPreviewRoot(1);
    const ref = { current: root };

    await exportQuoteToPdf(ref);

    expect(mockHtml2Canvas).toHaveBeenCalledTimes(1);
  });

  it('throws when the selector matches nothing', async () => {
    await expect(exportQuoteToPdf('#nonexistent')).rejects.toThrow('not found');
  });

  it('throws when the ref is null', async () => {
    const ref = { current: null };
    await expect(exportQuoteToPdf(ref)).rejects.toThrow('container ref is null');
  });

  it('throws when no preview pages exist', async () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    await expect(exportQuoteToPdf(root)).rejects.toThrow('no preview pages found');
  });

  it('waits for images inside preview pages to load before capturing', async () => {
    const root = createPreviewRoot(1);
    const img = document.createElement('img');
    img.src = 'data:image/png;base64,logo';
    root.querySelector('.quote-a4-page')!.appendChild(img);

    await exportQuoteToPdf(root);

    await waitFor(() => {
      expect(mockHtml2Canvas).toHaveBeenCalledTimes(1);
    });
  });
});
