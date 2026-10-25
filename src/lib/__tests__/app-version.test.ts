import { describe, expect, test } from 'vitest';

import packageJson from '../../../package.json';
import { APP_VERSION } from '../app-version';

describe('app version', () => {
  test('matches the version declared in package.json', () => {
    expect(APP_VERSION).toBe(packageJson.version);
  });

  test('uses a semver format', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});
