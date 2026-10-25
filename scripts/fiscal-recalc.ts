import { readFileSync } from 'node:fs';

import { calculateForfettario } from '../src/lib/calculations/forfettario';
import type { ForfettarioInput } from '../src/lib/calculations/types';
import { CURRENT_PROFILE, PROFILES, getProfile } from '../src/lib/fiscal';

const DEFAULT_INPUT: ForfettarioInput = {
  ricavi: 50000,
  atecoId: '8',
  contributiVersati: 0,
  mesiAttivita: 12,
  nuovaAttivita: false,
  tipoInps: 'gestioneSeparata',
  riduzioneInps: false,
  contributionHistory: 'post1995',
  speseDipendenti: 0,
  redditoDipendente: 0,
};

function getArg(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`Usage:
  npm run fiscal:recalc -- --list
  npm run fiscal:recalc -- --profile 2026.1 --input '{"ricavi":50000,"atecoId":"8"}'
  npm run fiscal:recalc -- --profile 2026.1 --input @input.json

Only forfettario inputs are supported. Output is JSON with profile metadata and result.`);
  process.exit(0);
}

if (process.argv.includes('--list')) {
  console.log(
    JSON.stringify(
      PROFILES.map((profile) => ({
        version: profile.version,
        year: profile.year,
        status: profile.status,
        validFrom: profile.validFrom,
        validTo: profile.validTo,
        checksum: profile.checksum,
      })),
      null,
      2,
    ),
  );
  process.exit(0);
}

const requestedVersion = getArg('--profile');
const profile = requestedVersion ? getProfile(requestedVersion) : CURRENT_PROFILE;

if (!profile) {
  console.error(
    `Unknown profile "${requestedVersion}". Available: ${PROFILES.map((item) => item.version).join(', ')}`,
  );
  process.exit(1);
}

const rawInput = getArg('--input');
let inputOverrides: Partial<ForfettarioInput> = {};

if (rawInput) {
  try {
    const text = rawInput.startsWith('@') ? readFileSync(rawInput.slice(1), 'utf8') : rawInput;
    inputOverrides = JSON.parse(text) as Partial<ForfettarioInput>;
  } catch (error) {
    console.error('Invalid --input JSON:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

const input: ForfettarioInput = { ...DEFAULT_INPUT, ...inputOverrides };

if (!Number.isFinite(input.ricavi) || input.ricavi < 0) {
  console.error('Input ricavi must be a non-negative finite number.');
  process.exit(1);
}

const result = calculateForfettario(input, profile);

console.log(
  JSON.stringify(
    {
      profile: {
        version: profile.version,
        year: profile.year,
        status: profile.status,
        validFrom: profile.validFrom,
        validTo: profile.validTo,
        checksum: profile.checksum,
      },
      input,
      result,
    },
    null,
    2,
  ),
);
