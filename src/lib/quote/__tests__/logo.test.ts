import { describe, expect, it } from 'vitest';
import { isSafeLogoDataUrl } from '../logo';

describe('isSafeLogoDataUrl', () => {
  it('accepts empty and raster image data URLs', () => {
    expect(isSafeLogoDataUrl('')).toBe(true);
    expect(isSafeLogoDataUrl('data:image/png;base64,aGVsbG8=')).toBe(true);
    expect(isSafeLogoDataUrl('data:image/jpeg;base64,aGVsbG8=')).toBe(true);
    expect(isSafeLogoDataUrl('data:image/webp;base64,aGVsbG8=')).toBe(true);
  });

  it('rejects SVG and non-image data URLs', () => {
    expect(isSafeLogoDataUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false);
    expect(isSafeLogoDataUrl('data:text/html;base64,PGgxPkJvb208L2gxPg==')).toBe(false);
  });
});
