import { describe, expect, it } from 'vitest';
import { buildPlanningProjection } from '../planning';

describe('buildPlanningProjection', () => {
  it('flags the 85k warning threshold', () => {
    const result = buildPlanningProjection(Array(12).fill(7500));

    expect(result.totaleAnnuo).toBe(90000);
    expect(result.limiteSuperato).toBe(true);
    expect(result.uscitaImmediata).toBe(false);
    expect(result.warnings).toEqual([
      expect.objectContaining({ code: 'revenue-over-85000', severity: 'warning' }),
    ]);
    expect(result.projection[0]).toEqual({ month: 'Gen', revenue: 7500, cumulativeRevenue: 7500 });
  });

  it('flags the 100k immediate exit threshold', () => {
    const result = buildPlanningProjection(Array(12).fill(9000));

    expect(result.totaleAnnuo).toBe(108000);
    expect(result.uscitaImmediata).toBe(true);
    expect(result.warnings).toEqual([
      expect.objectContaining({ code: 'revenue-over-100000', severity: 'critical' }),
    ]);
  });
});
