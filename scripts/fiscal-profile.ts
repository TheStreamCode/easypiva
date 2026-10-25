import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  ASSUMPTION_CHANGELOG_PATH,
  PROFILE_JSON_PATH,
  buildAssumptionChangelogMarkdown,
  buildProfileJson,
} from '../src/lib/fiscal/artifacts';

const check = process.argv.includes('--check');
const artifacts = [
  { path: PROFILE_JSON_PATH, content: buildProfileJson() },
  { path: ASSUMPTION_CHANGELOG_PATH, content: buildAssumptionChangelogMarkdown() },
];

let failures = 0;

for (const artifact of artifacts) {
  const absolutePath = resolve(artifact.path);
  const current = existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : '';

  if (current === artifact.content) {
    console.log(`OK ${artifact.path}`);
    continue;
  }

  if (check) {
    console.error(`Out of date: ${artifact.path}. Run npm run fiscal:write.`);
    failures += 1;
    continue;
  }

  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, artifact.content);
  console.log(`Wrote ${artifact.path}`);
}

if (failures > 0) {
  process.exitCode = 1;
}
