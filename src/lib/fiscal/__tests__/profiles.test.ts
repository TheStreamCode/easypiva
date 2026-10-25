import { describe, expect, test } from 'vitest';

import {
  CURRENT_PROFILE,
  PROFILES,
  getAtecoCategory,
  getAtecoCoefficient,
  getProfile,
  isProfileCurrent,
} from '../index';

const VERSION_PATTERN = /^\d{4}\.\d+$/;
const SOURCE_ID_PATTERN = /^[a-z0-9-]+$/;

describe('fiscal profiles registry', () => {
  test('exposes at least one profile and marks the last as current', () => {
    expect(PROFILES.length).toBeGreaterThan(0);
    expect(CURRENT_PROFILE).toBe(PROFILES[PROFILES.length - 1]);
    expect(CURRENT_PROFILE.status).toBe('current');
    expect(CURRENT_PROFILE.validTo).toBeNull();
  });

  test('has unique versions aligned with the tax year', () => {
    const versions = PROFILES.map((profile) => profile.version);
    expect(new Set(versions).size).toBe(versions.length);

    for (const profile of PROFILES) {
      expect(profile.version).toMatch(VERSION_PATTERN);
      expect(profile.version.startsWith(String(profile.year))).toBe(true);
      expect(profile.year).toBeGreaterThanOrEqual(2026);
    }
  });

  test('has closed, non-overlapping validity intervals', () => {
    const ordered = [...PROFILES].sort((a, b) => a.validFrom.localeCompare(b.validFrom));

    for (const [index, profile] of ordered.entries()) {
      expect(Number.isNaN(Date.parse(profile.validFrom))).toBe(false);
      expect(profile.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(profile.reviewedAt))).toBe(false);

      if (profile.status === 'archived') {
        expect(profile.validTo).not.toBeNull();
        expect(Date.parse(profile.validTo!)).toBeGreaterThan(Date.parse(profile.validFrom));
      } else {
        expect(profile.validTo).toBeNull();
      }

      const next = ordered[index + 1];
      if (next && profile.validTo) {
        expect(Date.parse(profile.validTo)).toBeLessThanOrEqual(Date.parse(next.validFrom));
      }
    }
  });

  test('is deeply frozen', () => {
    for (const profile of PROFILES) {
      expect(Object.isFrozen(profile)).toBe(true);
      expect(Object.isFrozen(profile.constants)).toBe(true);
      expect(Object.isFrozen(profile.constants.ateco)).toBe(true);
      expect(Object.isFrozen(profile.constants.ateco[0])).toBe(true);
      expect(Object.isFrozen(profile.constants.irpefBrackets)).toBe(true);
      expect(Object.isFrozen(profile.sources)).toBe(true);
    }
  });

  test('declares valid primary sources', () => {
    for (const profile of PROFILES) {
      expect(profile.sources.length).toBeGreaterThanOrEqual(3);
      const ids = profile.sources.map((source) => source.id);
      expect(new Set(ids).size).toBe(ids.length);

      for (const source of profile.sources) {
        expect(source.id).toMatch(SOURCE_ID_PATTERN);
        expect(source.label.length).toBeGreaterThan(10);
        expect(source.url).toMatch(/^https:\/\//);
      }
    }
  });

  test('keeps rounding rules aligned with the rounding module', () => {
    expect(CURRENT_PROFILE.rounding.currencyDecimals).toBe(0);
    expect(CURRENT_PROFILE.rounding.quoteComputationDecimals).toBe(6);
  });

  test('looks up profiles and ATECO categories', () => {
    expect(getProfile(CURRENT_PROFILE.version)).toBe(CURRENT_PROFILE);
    expect(getProfile('1999.1')).toBeUndefined();
    expect(isProfileCurrent(CURRENT_PROFILE.version)).toBe(true);
    expect(isProfileCurrent('1999.1')).toBe(false);

    expect(getAtecoCategory('8')).toBeDefined();
    expect(getAtecoCoefficient('8')).toBe(78);
    expect(getAtecoCoefficient('missing')).toBe(CURRENT_PROFILE.constants.atecoDefaultCoefficient);
  });

  test('serializes the IRPEF top bracket without Infinity', () => {
    const lastBracket =
      CURRENT_PROFILE.constants.irpefBrackets[CURRENT_PROFILE.constants.irpefBrackets.length - 1];

    expect(lastBracket.max).toBeNull();
  });
});
