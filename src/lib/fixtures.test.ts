import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scoreTransactions } from './engine';
import { checkIntegrity } from './integrity';
import { parseCsv } from './parse';

const load = (name: string) =>
  parseCsv(readFileSync(join(__dirname, '../../public/samples', name), 'utf-8'));

describe('sample fixtures', () => {
  it('healthy sample passes integrity and scores an APPROVE around 91', () => {
    const txns = load('sample_healthy.csv');
    expect(checkIntegrity(txns).valid).toBe(true);

    const result = scoreTransactions(txns);
    expect(result.verdict).toBe('APPROVE');
    expect(result.score).toBeGreaterThanOrEqual(86);
    expect(result.score).toBeLessThanOrEqual(98);
    expect(result.monthlyRepaymentCapacity).toBeGreaterThanOrEqual(760_000);
    expect(result.monthlyRepaymentCapacity).toBeLessThanOrEqual(960_000);
    expect(result.recommendedLimit).toBeCloseTo(2.5 * result.meanMonthlyNet, -3);
  });

  it('seasonal sample scores a REVIEW around 48', () => {
    const txns = load('sample_seasonal.csv');
    expect(checkIntegrity(txns).valid).toBe(true);

    const result = scoreTransactions(txns);
    expect(result.verdict).toBe('REVIEW');
    expect(result.score).toBeGreaterThanOrEqual(43);
    expect(result.score).toBeLessThanOrEqual(58);
  });

  it('tampered sample breaks integrity at rows 692 and 1379 only', () => {
    const report = checkIntegrity(load('sample_tampered.csv'));
    expect(report.valid).toBe(false);
    expect(report.brokenRows).toEqual([692, 1379]);
    expect(report.duplicateIds).toEqual([]);
    expect(report.outOfOrderRows).toEqual([]);
  });
});
