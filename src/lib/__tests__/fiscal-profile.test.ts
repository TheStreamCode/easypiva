import { describe, expect, test } from 'vitest';

import { FISCAL_PROFILE } from '../fiscal-data';
import {
  formatFiscalProfileLabel,
  formatFiscalProfileValidFrom,
  formatFiscalProfileValidity,
  getCalculatorPdfTitle,
  getFiscalProfileChecksumShort,
} from '../fiscal-profile';

describe('fiscal profile versioning', () => {
  test('exposes a coherent assumption version', () => {
    expect(FISCAL_PROFILE.year).toBeGreaterThanOrEqual(2026);
    expect(FISCAL_PROFILE.version).toMatch(/^\d{4}\.\d+$/);
    expect(FISCAL_PROFILE.version.startsWith(String(FISCAL_PROFILE.year))).toBe(true);
    expect(FISCAL_PROFILE.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(FISCAL_PROFILE.validFrom))).toBe(false);
    expect(FISCAL_PROFILE.checksum).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(FISCAL_PROFILE.sources.length).toBeGreaterThanOrEqual(3);
    expect(FISCAL_PROFILE.sources.every((source) => source.label.trim().length > 10)).toBe(true);
    expect(FISCAL_PROFILE.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
  });

  test('formats the validity interval and the UI label', () => {
    expect(formatFiscalProfileValidFrom()).toBe('01/01/2026');
    expect(formatFiscalProfileValidity()).toBe('in vigore dal 01/01/2026');
    expect(formatFiscalProfileLabel()).toBe(
      'assunzioni fiscali 2026, versione 2026.1 (in vigore dal 01/01/2026)',
    );
  });

  test('exposes a short checksum for the UI', () => {
    expect(getFiscalProfileChecksumShort()).toMatch(/^[0-9a-f]{12}$/);
  });

  test('formats the calculator PDF title with the assumption version', () => {
    expect(getCalculatorPdfTitle()).toBe(
      'Report EasyPIVA - Calcolo Forfettario 2026 (assunzioni 2026.1)',
    );
  });
});
