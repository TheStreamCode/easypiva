import { describe, expect, it } from 'vitest';
import { buildPlanningProjection } from '../planning';
import type { WarningCode } from '../types';

describe('buildPlanningProjection', () => {
  it('flags the 85k warning threshold', () => {
    const result = buildPlanningProjection(Array(12).fill(7500));
    const warningCodes: WarningCode[] = result.warnings.map((warning) => warning.code);

    expect(result.totaleAnnuo).toBe(90000);
    expect(result.limiteSuperato).toBe(true);
    expect(result.uscitaImmediata).toBe(false);
    expect(result.warnings).toEqual([
      expect.objectContaining({ code: 'revenue-over-85000', severity: 'warning' }),
    ]);
    expect(warningCodes).toEqual(['revenue-over-85000']);
    expect(result.projection[0]).toEqual({ month: 'Gen', revenue: 7500, cumulativeRevenue: 7500 });
  });

  it('flags the 100k immediate exit threshold', () => {
    const result = buildPlanningProjection(Array(12).fill(9000));
    const warningCodes: WarningCode[] = result.warnings.map((warning) => warning.code);

    expect(result.totaleAnnuo).toBe(108000);
    expect(result.uscitaImmediata).toBe(true);
    expect(result.warnings).toEqual([
      expect.objectContaining({ code: 'revenue-over-100000', severity: 'critical' }),
    ]);
    expect(warningCodes).toEqual(['revenue-over-100000']);
  });

  it('clamps negative monthly revenues to zero', () => {
    const result = buildPlanningProjection([-1000, 2000]);

    expect(result.projection[0]).toEqual({ month: 'Gen', revenue: 0, cumulativeRevenue: 0 });
    expect(result.projection[1]).toEqual({ month: 'Feb', revenue: 2000, cumulativeRevenue: 2000 });
    expect(result.totaleAnnuo).toBe(2000);
  });
});
