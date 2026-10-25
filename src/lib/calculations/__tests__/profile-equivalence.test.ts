import { describe, expect, test } from 'vitest';

import { calculateForfettario } from '../forfettario';
import { calculateInps } from '../inps';
import { compareRegimes } from '../comparison';
import { calculateTargetNet } from '../targetNet';
import { buildPlanningProjection } from '../planning';
import type { ForfettarioInput } from '../types';
import { getProfile } from '../../fiscal';

const archivedProfile = getProfile('2026.1');

const forfettarioInput: ForfettarioInput = {
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

describe('calculations with an explicit fiscal profile', () => {
  test('the archived 2026.1 profile is available', () => {
    expect(archivedProfile).toBeDefined();
    expect(archivedProfile?.version).toBe('2026.1');
  });

  test('default and explicit current profile produce identical results', () => {
    if (!archivedProfile) return;

    expect(calculateForfettario(forfettarioInput, archivedProfile)).toEqual(
      calculateForfettario(forfettarioInput),
    );
    expect(calculateInps(40000, 'artigiani', false, 'post1995', 12, archivedProfile)).toEqual(
      calculateInps(40000, 'artigiani'),
    );
    expect(
      compareRegimes(
        { ricavi: 50000, costiReali: 10000, atecoId: '8', nuovaAttivita: false },
        archivedProfile,
      ),
    ).toEqual(
      compareRegimes({ ricavi: 50000, costiReali: 10000, atecoId: '8', nuovaAttivita: false }),
    );
    expect(
      calculateTargetNet(
        {
          nettoMensile: 2000,
          atecoId: '8',
          nuovaAttivita: false,
          tipoInps: 'gestioneSeparata',
          riduzioneInps: false,
          contributionHistory: 'post1995',
        },
        archivedProfile,
      ),
    ).toEqual(
      calculateTargetNet({
        nettoMensile: 2000,
        atecoId: '8',
        nuovaAttivita: false,
        tipoInps: 'gestioneSeparata',
        riduzioneInps: false,
        contributionHistory: 'post1995',
      }),
    );
    expect(buildPlanningProjection([1000, 2000], archivedProfile)).toEqual(
      buildPlanningProjection([1000, 2000]),
    );
  });
});
