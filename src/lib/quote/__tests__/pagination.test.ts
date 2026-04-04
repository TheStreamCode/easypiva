import { describe, expect, it } from 'vitest';

import { paginateQuoteBlocks, type QuotePaginationBlock } from '../pagination';

function createBlock(
  kind: QuotePaginationBlock['kind'],
  id: string,
  height: number,
  overrides: Partial<QuotePaginationBlock> = {},
): QuotePaginationBlock {
  return {
    kind,
    id,
    height,
    ...overrides,
  } as QuotePaginationBlock;
}

function summarizePage(blocks: QuotePaginationBlock[]) {
  return blocks.map((block) => {
    const summary = {
      id: block.id,
      kind: block.kind,
      height: block.height,
      repeated: block.repeated ?? false,
      sourceId: block.sourceId ?? block.id,
      continuationIndex: block.continuationIndex ?? 0,
    } as {
      id: string;
      kind: QuotePaginationBlock['kind'];
      height: number;
      repeated: boolean;
      sourceId: string;
      continuationIndex: number;
      continuesDescription?: boolean;
    };

    const continuesDescription = (
      block as QuotePaginationBlock & {
        continuesDescription?: boolean;
      }
    ).continuesDescription;

    if (continuesDescription) {
      summary.continuesDescription = true;
    }

    return summary;
  });
}

describe('paginateQuoteBlocks', () => {
  it('splits many item rows across pages and keeps each row intact when it can fit on a fresh page', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 100,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 12),
        createBlock('client', 'client', 12),
        createBlock('meta', 'meta', 12),
        createBlock('items-header', 'items-header', 8),
        createBlock('item-row', 'row-1', 14),
        createBlock('item-row', 'row-2', 14),
        createBlock('item-row', 'row-3', 14),
        createBlock('item-row', 'row-4', 14),
        createBlock('item-row', 'row-5', 14),
      ],
    });

    expect(pages).toHaveLength(2);
    expect(summarizePage(pages[0].blocks)).toEqual([
      {
        id: 'header',
        kind: 'header',
        height: 12,
        repeated: false,
        sourceId: 'header',
        continuationIndex: 0,
      },
      {
        id: 'client',
        kind: 'client',
        height: 12,
        repeated: false,
        sourceId: 'client',
        continuationIndex: 0,
      },
      {
        id: 'meta',
        kind: 'meta',
        height: 12,
        repeated: false,
        sourceId: 'meta',
        continuationIndex: 0,
      },
      {
        id: 'items-header',
        kind: 'items-header',
        height: 8,
        repeated: false,
        sourceId: 'items-header',
        continuationIndex: 0,
      },
      {
        id: 'row-1',
        kind: 'item-row',
        height: 14,
        repeated: false,
        sourceId: 'row-1',
        continuationIndex: 0,
      },
      {
        id: 'row-2',
        kind: 'item-row',
        height: 14,
        repeated: false,
        sourceId: 'row-2',
        continuationIndex: 0,
      },
      {
        id: 'row-3',
        kind: 'item-row',
        height: 14,
        repeated: false,
        sourceId: 'row-3',
        continuationIndex: 0,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
    expect(summarizePage(pages[1].blocks)).toEqual([
      {
        id: 'items-header-page-2',
        kind: 'items-header',
        height: 8,
        repeated: true,
        sourceId: 'items-header',
        continuationIndex: 0,
      },
      {
        id: 'row-4',
        kind: 'item-row',
        height: 14,
        repeated: false,
        sourceId: 'row-4',
        continuationIndex: 0,
      },
      {
        id: 'row-5',
        kind: 'item-row',
        height: 14,
        repeated: false,
        sourceId: 'row-5',
        continuationIndex: 0,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
  });

  it('repeats the table header whenever an item row moves to the next page', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 80,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 14),
        createBlock('items-header', 'items-header', 8),
        createBlock('item-row', 'row-short', 18),
        createBlock('item-row', 'row-long', 31),
      ],
    });

    expect(pages).toHaveLength(2);
    expect(pages[1].blocks[0]).toMatchObject({
      kind: 'items-header',
      repeated: true,
      sourceId: 'items-header',
    });
    expect(pages[1].blocks[1]).toMatchObject({
      id: 'row-long',
      kind: 'item-row',
      continuationIndex: 0,
    });
  });

  it('moves a tall but page-fit item row intact to the next page when remaining space is too small', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 100,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 20),
        createBlock('items-header', 'items-header', 10),
        createBlock('item-row', 'row-1', 35),
        createBlock('item-row', 'row-2', 30),
      ],
    });

    expect(pages).toHaveLength(2);
    expect(pages[0].blocks.map((block) => block.id)).toEqual([
      'header',
      'items-header',
      'row-1',
      'footer-template',
    ]);
    expect(pages[1].blocks.map((block) => block.id)).toEqual([
      'items-header-page-2',
      'row-2',
      'footer-template',
    ]);
  });

  it('moves a normal long wrapped item description intact to the next page near a boundary', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 100,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 18),
        createBlock('items-header', 'items-header', 10),
        createBlock('item-row', 'row-short', 34),
        createBlock('item-row', 'row-long-description', 29),
      ],
    });

    expect(pages).toHaveLength(2);
    expect(pages[0].blocks.map((block) => block.id)).toEqual([
      'header',
      'items-header',
      'row-short',
      'footer-template',
    ]);
    expect(summarizePage(pages[1].blocks)).toEqual([
      {
        id: 'items-header-page-2',
        kind: 'items-header',
        height: 10,
        repeated: true,
        sourceId: 'items-header',
        continuationIndex: 0,
      },
      {
        id: 'row-long-description',
        kind: 'item-row',
        height: 29,
        repeated: false,
        sourceId: 'row-long-description',
        continuationIndex: 0,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
  });

  it('splits long notes cleanly across page boundaries', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 80,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 20),
        createBlock('notes', 'notes', 55, {
          splitHeights: [20, 20, 15],
        }),
      ],
    });

    expect(pages).toHaveLength(2);
    expect(summarizePage(pages[0].blocks)).toEqual([
      {
        id: 'header',
        kind: 'header',
        height: 20,
        repeated: false,
        sourceId: 'header',
        continuationIndex: 0,
      },
      {
        id: 'notes-part-1',
        kind: 'notes',
        height: 40,
        repeated: false,
        sourceId: 'notes',
        continuationIndex: 1,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
    expect(summarizePage(pages[1].blocks)).toEqual([
      {
        id: 'notes-part-2',
        kind: 'notes',
        height: 15,
        repeated: false,
        sourceId: 'notes',
        continuationIndex: 2,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
  });

  it('splits a long final disclaimer cleanly near the bottom of a page', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 100,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 20),
        createBlock('totals', 'totals', 40),
        createBlock('disclaimer', 'disclaimer', 40, {
          splitHeights: [18, 12, 10],
        }),
      ],
    });

    expect(pages).toHaveLength(2);
    expect(pages[0].blocks.map((block) => block.id)).toEqual([
      'header',
      'totals',
      'disclaimer-part-1',
      'footer-template',
    ]);
    expect(pages[1].blocks.map((block) => block.id)).toEqual([
      'disclaimer-part-2',
      'footer-template',
    ]);
  });

  it('continues only the oversized item row description when the row is taller than a full page', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 100,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 16),
        createBlock('items-header', 'items-header', 8),
        createBlock('item-row', 'oversized-row', 150, {
          descriptionContinuationHeights: [50, 50, 50],
        } as Partial<QuotePaginationBlock> & {
          descriptionContinuationHeights: number[];
        }),
      ],
    });

    expect(pages).toHaveLength(3);
    expect(summarizePage(pages[0].blocks)).toEqual([
      {
        id: 'header',
        kind: 'header',
        height: 16,
        repeated: false,
        sourceId: 'header',
        continuationIndex: 0,
      },
      {
        id: 'items-header',
        kind: 'items-header',
        height: 8,
        repeated: false,
        sourceId: 'items-header',
        continuationIndex: 0,
      },
      {
        id: 'oversized-row-part-1',
        kind: 'item-row',
        height: 50,
        repeated: false,
        sourceId: 'oversized-row',
        continuationIndex: 1,
        continuesDescription: true,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
    expect(summarizePage(pages[1].blocks)).toEqual([
      {
        id: 'items-header-page-2',
        kind: 'items-header',
        height: 8,
        repeated: true,
        sourceId: 'items-header',
        continuationIndex: 0,
      },
      {
        id: 'oversized-row-part-2',
        kind: 'item-row',
        height: 50,
        repeated: false,
        sourceId: 'oversized-row',
        continuationIndex: 2,
        continuesDescription: true,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
    expect(summarizePage(pages[2].blocks)).toEqual([
      {
        id: 'items-header-page-3',
        kind: 'items-header',
        height: 8,
        repeated: true,
        sourceId: 'items-header',
        continuationIndex: 0,
      },
      {
        id: 'oversized-row-part-3',
        kind: 'item-row',
        height: 50,
        repeated: false,
        sourceId: 'oversized-row',
        continuationIndex: 3,
        continuesDescription: true,
      },
      {
        id: 'footer-template',
        kind: 'footer',
        height: 10,
        repeated: false,
        sourceId: 'footer-template',
        continuationIndex: 0,
      },
    ]);
  });

  it('rejects an item row continuation that cannot fit with the repeated items header on a fresh page', () => {
    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: createBlock('footer', 'footer-template', 10),
        blocks: [
          createBlock('header', 'header', 16),
          createBlock('items-header', 'items-header', 8),
          createBlock('item-row', 'oversized-row', 142, {
            descriptionContinuationHeights: [50, 83, 9],
          } as Partial<QuotePaginationBlock> & {
            descriptionContinuationHeights: number[];
          }),
        ],
      }),
    ).toThrow('cannot fit with the repeated items header');
  });

  it('rejects a split text segment that is taller than the available content height', () => {
    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: createBlock('footer', 'footer-template', 10),
        blocks: [
          createBlock('notes', 'notes', 100, {
            splitHeights: [91, 9],
          }),
        ],
      }),
    ).toThrow('has a split segment that exceeds the available page height');
  });

  it('rejects a footer block that is not marked as footer', () => {
    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: createBlock('notes', 'not-footer', 10, {
          splitHeights: [10],
        }) as QuotePaginationBlock,
        blocks: [createBlock('header', 'header', 20)],
      }),
    ).toThrow('Footer block must use kind footer');
  });

  it('rejects split text blocks when splitHeights do not add up to the block height', () => {
    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: createBlock('footer', 'footer-template', 10),
        blocks: [
          createBlock('notes', 'notes', 50, {
            splitHeights: [20, 20],
          }),
        ],
      }),
    ).toThrow('split heights must add up to the block height');
  });

  it('rejects oversized item rows when description continuation heights do not add up to the row height', () => {
    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: createBlock('footer', 'footer-template', 10),
        blocks: [
          createBlock('items-header', 'items-header', 8),
          createBlock('item-row', 'oversized-row', 150, {
            descriptionContinuationHeights: [50, 50, 40],
          } as Partial<QuotePaginationBlock> & {
            descriptionContinuationHeights: number[];
          }),
        ],
      }),
    ).toThrow('description continuation heights must add up to the row height');
  });

  it('accepts minor floating-point drift in split and continuation height totals', () => {
    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: createBlock('footer', 'footer-template', 10),
        blocks: [
          createBlock('items-header', 'items-header', 8),
          createBlock('notes', 'notes-decimal', 0.3, {
            splitHeights: [0.1, 0.2],
          }),
          createBlock('item-row', 'oversized-row-decimal', 82, {
            descriptionContinuationHeights: [40.4, 41.60000000000001],
          } as Partial<QuotePaginationBlock> & {
            descriptionContinuationHeights: number[];
          }),
        ],
      }),
    ).not.toThrow();
  });

  it('injects the footer attribution on every produced page', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 90,
      footerBlock: createBlock('footer', 'footer-template', 10),
      blocks: [
        createBlock('header', 'header', 20),
        createBlock('notes', 'notes', 45, {
          splitHeights: [15, 15, 15],
        }),
        createBlock('payment', 'payment', 25),
      ],
    });

    expect(pages).toHaveLength(2);
    expect(pages.every((page) => page.blocks[page.blocks.length - 1]?.kind === 'footer')).toBe(
      true,
    );
    expect(
      pages.every((page) => page.blocks[page.blocks.length - 1]?.id === 'footer-template'),
    ).toBe(true);
  });
});
