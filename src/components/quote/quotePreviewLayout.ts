const CARD_PADDING_HEIGHT = 8;
const CARD_LABEL_HEIGHT = 4;
const CARD_VALUE_LINE_HEIGHT = 4.8;
const CARD_TITLE_LINE_HEIGHT = 6;
const CARD_LINE_GAP = 1.2;
const CARD_GROUP_GAP = 3;

function splitLongToken(token: string, maxCharsPerLine: number): string[] {
  if (token.length <= maxCharsPerLine) {
    return [token];
  }

  const chunks: string[] = [];

  for (let index = 0; index < token.length; index += maxCharsPerLine) {
    chunks.push(token.slice(index, index + maxCharsPerLine));
  }

  return chunks;
}

function normalizeParagraphTokens(paragraph: string, maxCharsPerLine: number): string[] {
  return paragraph
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((token) => splitLongToken(token, maxCharsPerLine));
}

export function wrapTextLines(text: string, maxCharsPerLine: number): string[] {
  const paragraphs = text
    .split(/\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [];
  }

  const lines: string[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const tokens = normalizeParagraphTokens(paragraph, maxCharsPerLine);
    let currentLine = '';

    tokens.forEach((token) => {
      const nextLine = currentLine ? `${currentLine} ${token}` : token;

      if (nextLine.length <= maxCharsPerLine) {
        currentLine = nextLine;
        return;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = token;
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    if (paragraphIndex < paragraphs.length - 1) {
      lines.push('');
    }
  });

  return lines;
}

export function countWrappedLines(text: string, maxCharsPerLine: number): number {
  return Math.max(1, wrapTextLines(text, maxCharsPerLine).length || 1);
}

export function estimatePartyCardHeight(
  title: string,
  lines: string[],
  maxCharsPerLine: number,
): number {
  const titleLines = countWrappedLines(title, maxCharsPerLine);
  const bodyLineCount = lines.reduce(
    (sum, line) => sum + countWrappedLines(line, maxCharsPerLine),
    0,
  );
  const bodyGap = Math.max(0, bodyLineCount - 1) * CARD_LINE_GAP;

  return (
    CARD_PADDING_HEIGHT +
    CARD_LABEL_HEIGHT +
    2 +
    titleLines * CARD_TITLE_LINE_HEIGHT +
    2 +
    bodyLineCount * CARD_VALUE_LINE_HEIGHT +
    bodyGap +
    2
  );
}

function estimateFieldGroupHeight(value: string, maxCharsPerLine: number): number {
  const valueLines = countWrappedLines(value, maxCharsPerLine);

  return CARD_LABEL_HEIGHT + 1 + valueLines * CARD_VALUE_LINE_HEIGHT;
}

export function estimateFieldsCardHeight(values: string[], maxCharsPerLine: number): number {
  const groupsHeight = values.reduce(
    (sum, value) => sum + estimateFieldGroupHeight(value, maxCharsPerLine),
    0,
  );

  return (
    CARD_PADDING_HEIGHT +
    CARD_LABEL_HEIGHT +
    3 +
    groupsHeight +
    Math.max(0, values.length - 1) * CARD_GROUP_GAP +
    2
  );
}

export function estimateSimpleCardHeight(lines: string[], maxCharsPerLine: number): number {
  const lineCount = lines.reduce((sum, line) => sum + countWrappedLines(line, maxCharsPerLine), 0);
  const lineGap = Math.max(0, lineCount - 1) * CARD_LINE_GAP;

  return (
    CARD_PADDING_HEIGHT + CARD_LABEL_HEIGHT + 3 + lineCount * CARD_VALUE_LINE_HEIGHT + lineGap + 2
  );
}
