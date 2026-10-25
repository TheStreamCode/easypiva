import { createHash } from 'node:crypto';
import { describe, expect, test } from 'vitest';

import { serializeProfile } from '../canonical';
import { PROFILES } from '../index';

function expectedChecksum(profile: (typeof PROFILES)[number]) {
  const digest = createHash('sha256').update(serializeProfile(profile), 'utf8').digest('hex');
  return `sha256:${digest}`;
}

describe('fiscal profile integrity', () => {
  test('every profile checksum matches its constants', () => {
    for (const profile of PROFILES) {
      expect(profile.checksum).toBe(expectedChecksum(profile));
    }
  });

  test('checksums use a sha256 prefix and 64 hex characters', () => {
    for (const profile of PROFILES) {
      expect(profile.checksum).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  test('canonical serialization is deterministic and JSON-safe', () => {
    for (const profile of PROFILES) {
      const first = serializeProfile(profile);
      const second = serializeProfile(profile);

      expect(first).toBe(second);
      expect(first).not.toContain('Infinity');
      expect(() => JSON.parse(first)).not.toThrow();
    }
  });
});
