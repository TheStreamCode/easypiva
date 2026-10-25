import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

import {
  ASSUMPTION_CHANGELOG_PATH,
  PROFILE_JSON_PATH,
  buildAssumptionChangelogMarkdown,
  buildProfileJson,
} from '../artifacts';
import { CURRENT_PROFILE, PROFILES } from '../index';

function readArtifact(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('generated fiscal artifacts', () => {
  test('public fiscal-profile.json is up to date', () => {
    expect(readArtifact(PROFILE_JSON_PATH)).toBe(buildProfileJson());
  });

  test('public JSON exposes every profile with checksum and sources', () => {
    const payload = JSON.parse(readArtifact(PROFILE_JSON_PATH)) as {
      schemaVersion: number;
      current: string;
      profiles: Array<{
        version: string;
        checksum: string;
        validFrom: string;
        sources: Array<{ id: string; url: string }>;
      }>;
    };

    expect(payload.schemaVersion).toBe(1);
    expect(payload.current).toBe(CURRENT_PROFILE.version);
    expect(payload.profiles).toHaveLength(PROFILES.length);

    for (const profile of payload.profiles) {
      expect(profile.checksum).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(profile.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(profile.sources.length).toBeGreaterThanOrEqual(3);
      expect(profile.sources.every((source) => source.url.startsWith('https://'))).toBe(true);
    }
  });

  test('assumption changelog is up to date', () => {
    expect(readArtifact(ASSUMPTION_CHANGELOG_PATH)).toBe(buildAssumptionChangelogMarkdown());
  });
});
