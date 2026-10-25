import { ASSUMPTION_CHANGES } from './assumption-changes';
import { toCanonicalProfile } from './canonical';
import { CURRENT_PROFILE, PROFILES } from './index';

export const PROFILE_JSON_PATH = 'public/fiscal-profile.json';
export const ASSUMPTION_CHANGELOG_PATH = 'docs/fiscal/assumption-changelog.md';

/** Deterministic public payload: no timestamps, fixed key order. */
export function buildProfileJson() {
  const payload = {
    schemaVersion: 1,
    current: CURRENT_PROFILE.version,
    profiles: PROFILES.map((profile) => ({
      ...toCanonicalProfile(profile),
      checksum: profile.checksum,
    })),
  };

  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function buildAssumptionChangelogMarkdown() {
  const lines: string[] = [
    '# Storico delle assunzioni fiscali',
    '',
    'Generato da `src/lib/fiscal/assumption-changes.ts`. Non modificare a mano.',
    '',
  ];

  for (const entry of ASSUMPTION_CHANGES) {
    lines.push(`## ${entry.version} - ${entry.date}`, '');
    lines.push(`Release app: ${entry.appRelease}`, '');
    lines.push(entry.summary, '');

    for (const change of entry.changes) {
      const source = change.sourceId ? ` (fonte: ${change.sourceId})` : '';
      lines.push(`- \`${change.field}\`: ${change.from} -> ${change.to}${source}`);
    }

    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}
