export type QuotePaginationBlockKind =
  | 'header'
  | 'client'
  | 'meta'
  | 'items-header'
  | 'item-row'
  | 'notes'
  | 'payment'
  | 'disclaimer'
  | 'totals'
  | 'footer';

type QuotePaginationBlockBase<TKind extends QuotePaginationBlockKind> = {
  id: string;
  kind: TKind;
  height: number;
  sourceId?: string;
  repeated?: boolean;
  continuationIndex?: number;
};

export type QuotePaginationStaticBlock = QuotePaginationBlockBase<
  Exclude<QuotePaginationBlockKind, 'item-row' | 'notes' | 'disclaimer'>
> & {
  splitHeights?: never;
  descriptionContinuationHeights?: never;
  continuesDescription?: never;
};

export type QuotePaginationSplitTextBlock = QuotePaginationBlockBase<'notes' | 'disclaimer'> & {
  splitHeights?: number[];
  descriptionContinuationHeights?: never;
  continuesDescription?: never;
};

export type QuotePaginationItemRowBlock = QuotePaginationBlockBase<'item-row'> & {
  splitHeights?: never;
  descriptionContinuationHeights?: number[];
  continuesDescription?: boolean;
};

export type QuotePaginationBlock =
  | QuotePaginationStaticBlock
  | QuotePaginationSplitTextBlock
  | QuotePaginationItemRowBlock;

export type QuotePaginationPage = {
  number: number;
  blocks: QuotePaginationBlock[];
};

export type PaginateQuoteBlocksInput = {
  pageHeight: number;
  footerBlock: QuotePaginationBlock;
  blocks: QuotePaginationBlock[];
};

type MutableQuotePaginationPage = {
  number: number;
  blocks: QuotePaginationBlock[];
  usedHeight: number;
};

const SPLITTABLE_TEXT_BLOCKS = new Set<QuotePaginationBlockKind>(['notes', 'disclaimer']);
const HEIGHT_SUM_TOLERANCE = 0.000001;

function createPage(number: number): MutableQuotePaginationPage {
  return {
    number,
    blocks: [],
    usedHeight: 0,
  };
}

function cloneBlock(
  block: QuotePaginationBlock,
  overrides: Partial<QuotePaginationBlock> = {},
): QuotePaginationBlock {
  return {
    ...block,
    sourceId: block.sourceId ?? block.id,
    continuationIndex: block.continuationIndex ?? 0,
    ...overrides,
  } as QuotePaginationBlock;
}

function isPageEmpty(page: MutableQuotePaginationPage) {
  return page.blocks.length === 0;
}

function appendBlock(page: MutableQuotePaginationPage, block: QuotePaginationBlock) {
  page.blocks.push(block);
  page.usedHeight += block.height;
}

function finalizePage(
  pages: QuotePaginationPage[],
  page: MutableQuotePaginationPage,
  footerBlock: QuotePaginationBlock,
) {
  if (isPageEmpty(page)) {
    return;
  }

  pages.push({
    number: page.number,
    blocks: [...page.blocks, cloneBlock(footerBlock)],
  });
}

function requirePositiveHeights(block: QuotePaginationBlock) {
  if (block.height <= 0 || !Number.isFinite(block.height)) {
    throw new Error(`Block ${block.id} must have a positive finite height.`);
  }
}

function getHeightsTotal(heights: number[]) {
  return heights.reduce((sum, height) => sum + height, 0);
}

function heightsMatchWithinTolerance(total: number, expected: number) {
  return Math.abs(total - expected) <= HEIGHT_SUM_TOLERANCE;
}

function validateBlockContract(block: QuotePaginationBlock) {
  if (block.kind === 'item-row') {
    if (block.splitHeights) {
      throw new Error(
        `Item row ${block.id} must use descriptionContinuationHeights instead of splitHeights.`,
      );
    }

    return;
  }

  if (block.descriptionContinuationHeights) {
    throw new Error(`Block ${block.id} can only use descriptionContinuationHeights on item rows.`);
  }

  if (!SPLITTABLE_TEXT_BLOCKS.has(block.kind) && block.splitHeights) {
    throw new Error(`Block ${block.id} can only use splitHeights on notes or disclaimer blocks.`);
  }
}

function requireSplitHeights(block: QuotePaginationBlock) {
  if (!block.splitHeights || block.splitHeights.length === 0) {
    throw new Error(`Block ${block.id} requires split heights.`);
  }

  if (block.splitHeights.some((height) => height <= 0 || !Number.isFinite(height))) {
    throw new Error(`Block ${block.id} has invalid split heights.`);
  }

  if (!heightsMatchWithinTolerance(getHeightsTotal(block.splitHeights), block.height)) {
    throw new Error(`Block ${block.id} split heights must add up to the block height.`);
  }

  return block.splitHeights;
}

function requireDescriptionContinuationHeights(block: QuotePaginationBlock) {
  if (!block.descriptionContinuationHeights || block.descriptionContinuationHeights.length === 0) {
    throw new Error(`Item row ${block.id} requires description continuation heights.`);
  }

  if (
    block.descriptionContinuationHeights.some((height) => height <= 0 || !Number.isFinite(height))
  ) {
    throw new Error(`Item row ${block.id} has invalid description continuation heights.`);
  }

  if (
    !heightsMatchWithinTolerance(
      getHeightsTotal(block.descriptionContinuationHeights),
      block.height,
    )
  ) {
    throw new Error(
      `Item row ${block.id} description continuation heights must add up to the row height.`,
    );
  }

  return block.descriptionContinuationHeights;
}

function getRepeatedItemsHeaderHeight(activeItemsHeader: QuotePaginationBlock | null) {
  if (!activeItemsHeader) {
    return 0;
  }

  return activeItemsHeader.height;
}

export function paginateQuoteBlocks(input: PaginateQuoteBlocksInput): QuotePaginationPage[] {
  if (input.footerBlock.kind !== 'footer') {
    throw new Error('Footer block must use kind footer.');
  }

  requirePositiveHeights(input.footerBlock);

  const contentHeight = input.pageHeight - input.footerBlock.height;

  if (contentHeight <= 0) {
    throw new Error('Page height must be larger than the footer height.');
  }

  const pages: QuotePaginationPage[] = [];
  let currentPage = createPage(1);
  let activeItemsHeader: QuotePaginationBlock | null = null;

  function startNewPage() {
    finalizePage(pages, currentPage, input.footerBlock);
    currentPage = createPage(currentPage.number + 1);
  }

  function ensureItemsHeaderOnCurrentPage() {
    if (!activeItemsHeader || !isPageEmpty(currentPage)) {
      return;
    }

    appendBlock(
      currentPage,
      cloneBlock(activeItemsHeader, {
        id: `${activeItemsHeader.id}-page-${currentPage.number}`,
        repeated: true,
      }),
    );
  }

  function getFreshItemsPageCapacity() {
    return contentHeight - getRepeatedItemsHeaderHeight(activeItemsHeader);
  }

  function ensureSpace(height: number, block: QuotePaginationBlock) {
    if (height > contentHeight) {
      throw new Error(`Block ${block.id} exceeds the available page height.`);
    }

    if (currentPage.usedHeight + height > contentHeight) {
      startNewPage();
    }
  }

  function placeWholeBlock(block: QuotePaginationBlock) {
    ensureSpace(block.height, block);
    appendBlock(currentPage, cloneBlock(block));
  }

  function placeSplitTextBlock(block: QuotePaginationBlock) {
    const splitHeights = requireSplitHeights(block);

    if (splitHeights.some((height) => height > contentHeight)) {
      throw new Error(
        `Block ${block.id} has a split segment that exceeds the available page height.`,
      );
    }

    let offset = 0;
    let partIndex = 1;

    while (offset < splitHeights.length) {
      if (!isPageEmpty(currentPage) && currentPage.usedHeight >= contentHeight) {
        startNewPage();
      }

      let partHeight = 0;
      let consumedSegments = 0;

      while (offset + consumedSegments < splitHeights.length) {
        const nextHeight = splitHeights[offset + consumedSegments];

        if (currentPage.usedHeight + partHeight + nextHeight > contentHeight) {
          break;
        }

        partHeight += nextHeight;
        consumedSegments += 1;
      }

      if (consumedSegments === 0) {
        if (!isPageEmpty(currentPage)) {
          startNewPage();
          continue;
        }

        throw new Error(
          `Block ${block.id} has a split segment that exceeds the remaining page height.`,
        );
      }

      appendBlock(
        currentPage,
        cloneBlock(block, {
          id: `${block.id}-part-${partIndex}`,
          height: partHeight,
          continuationIndex: partIndex,
        }),
      );

      offset += consumedSegments;
      partIndex += 1;
    }
  }

  function placeOversizedItemRow(block: QuotePaginationBlock) {
    const splitHeights = requireDescriptionContinuationHeights(block);
    const freshItemsPageCapacity = getFreshItemsPageCapacity();

    for (let index = 0; index < splitHeights.length; index += 1) {
      const partHeight = splitHeights[index];

      if (partHeight > freshItemsPageCapacity) {
        throw new Error(
          `Item row continuation ${block.id} cannot fit with the repeated items header.`,
        );
      }

      if (isPageEmpty(currentPage)) {
        ensureItemsHeaderOnCurrentPage();
      }

      if (currentPage.usedHeight + partHeight > contentHeight) {
        startNewPage();
        ensureItemsHeaderOnCurrentPage();
      }

      appendBlock(
        currentPage,
        cloneBlock(block, {
          id: `${block.id}-part-${index + 1}`,
          height: partHeight,
          continuationIndex: index + 1,
          continuesDescription: true,
        }),
      );
    }
  }

  for (const block of input.blocks) {
    requirePositiveHeights(block);
    validateBlockContract(block);

    if (block.kind === 'footer') {
      continue;
    }

    if (block.kind === 'items-header') {
      activeItemsHeader = cloneBlock(block);
      placeWholeBlock(block);
      continue;
    }

    if (block.kind === 'item-row') {
      const freshItemsPageCapacity = getFreshItemsPageCapacity();

      if (block.height <= contentHeight && block.height <= freshItemsPageCapacity) {
        if (isPageEmpty(currentPage)) {
          ensureItemsHeaderOnCurrentPage();
        }

        if (currentPage.usedHeight + block.height > contentHeight) {
          startNewPage();
          ensureItemsHeaderOnCurrentPage();
        }

        appendBlock(currentPage, cloneBlock(block));
        continue;
      }

      if (block.height <= contentHeight && block.height > freshItemsPageCapacity) {
        throw new Error(`Item row ${block.id} cannot fit with the repeated items header.`);
      }

      placeOversizedItemRow(block);
      continue;
    }

    if (SPLITTABLE_TEXT_BLOCKS.has(block.kind) && block.splitHeights) {
      placeSplitTextBlock(block);
      continue;
    }

    placeWholeBlock(block);
  }

  finalizePage(pages, currentPage, input.footerBlock);

  return pages;
}
