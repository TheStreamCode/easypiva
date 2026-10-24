import { describe, expect, test } from 'vitest';

import { paginateQuoteBlocks, type QuotePaginationBlock } from '../pagination';

const footer: QuotePaginationBlock = { id: 'footer', kind: 'footer', height: 10 };

function block(id: string, height: number): QuotePaginationBlock {
  return { id, kind: 'header', height };
}

describe('paginateQuoteBlocks block gap', () => {
  test('does not count a gap for the first block on a page', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 130,
      footerBlock: footer,
      blocks: [block('a', 30), block('b', 30), block('c', 30)],
      blockGap: 5,
    });

    // 30 + 5 + 30 + 5 + 30 = 100 fits in 120 available; only two gaps are counted.
    expect(pages).toHaveLength(1);
    expect(pages[0].blocks.map((item) => item.id)).toEqual(['a', 'b', 'c', 'footer']);
  });

  test('counts the gap between blocks when fitting a page', () => {
    const pages = paginateQuoteBlocks({
      pageHeight: 100,
      footerBlock: footer,
      blocks: [block('a', 30), block('b', 30), block('c', 30), block('d', 30)],
      blockGap: 5,
    });

    // 30 + 5 + 30 + 5 + 30 = 100 > 90 available, so only two blocks fit on page 1.
    expect(pages).toHaveLength(2);
    expect(pages[0].blocks.map((item) => item.id)).toEqual(['a', 'b', 'footer']);
    expect(pages[1].blocks.map((item) => item.id)).toEqual(['c', 'd', 'footer']);
  });

  test('splits text blocks using the gap budget', () => {
    const splitBlock: QuotePaginationBlock = {
      id: 'notes',
      kind: 'notes',
      height: 60,
      splitHeights: [20, 20, 20],
    };

    const pages = paginateQuoteBlocks({
      pageHeight: 60,
      footerBlock: footer,
      blocks: [splitBlock],
      blockGap: 5,
    });

    expect(pages).toHaveLength(2);
    expect(pages[0].blocks[0]).toMatchObject({ id: 'notes-part-1', height: 40 });
    expect(pages[1].blocks[0]).toMatchObject({ id: 'notes-part-2', height: 20 });
  });

  test('rejects a negative or non-finite gap', () => {
    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: footer,
        blocks: [block('a', 10)],
        blockGap: -1,
      }),
    ).toThrow(/block gap/i);

    expect(() =>
      paginateQuoteBlocks({
        pageHeight: 100,
        footerBlock: footer,
        blocks: [block('a', 10)],
        blockGap: Number.NaN,
      }),
    ).toThrow(/block gap/i);
  });
});
