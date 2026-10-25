import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { PROFILES } from '../src/lib/fiscal';
import { serializeProfile } from '../src/lib/fiscal/canonical';

function expectedChecksum(profile: (typeof PROFILES)[number]) {
  const digest = createHash('sha256').update(serializeProfile(profile), 'utf8').digest('hex');
  return `sha256:${digest}`;
}

const write = process.argv.includes('--write');
let failures = 0;

for (const profile of PROFILES) {
  const expected = expectedChecksum(profile);

  if (expected === profile.checksum) {
    console.log(`OK ${profile.version} ${expected.slice(0, 19)}...`);
    continue;
  }

  if (!write) {
    console.error(
      `Checksum mismatch for ${profile.version}: expected ${expected}, found ${profile.checksum}. Run npm run fiscal:checksum.`,
    );
    failures += 1;
    continue;
  }

  const profilePath = resolve(`src/lib/fiscal/profiles/${profile.version}.ts`);
  const source = readFileSync(profilePath, 'utf8');
  const updated = source.replace(/checksum: 'sha256:[^']*'/, `checksum: '${expected}'`);

  if (updated === source) {
    console.error(`Could not update checksum literal in ${profilePath}`);
    failures += 1;
    continue;
  }

  mkdirSync(dirname(profilePath), { recursive: true });
  writeFileSync(profilePath, updated);
  console.log(`Updated ${profile.version} checksum in ${profilePath}`);
}

if (failures > 0) {
  process.exitCode = 1;
}
