import { describe, expect, it } from 'vitest';
import { aggregateMonths, assessLoan, scoreTransactions, verdictForScore } from './engine';
import { buildIntegrityAudit, checkIntegrity, integrityRowsForDisplay } from './integrity';
import type { ScoreResult, Transaction, TxnType } from './types';

interface RowSpec {
  date: string;
  type: TxnType;
  amount: number;
  fee?: number;
}

function makeTxns(rows: RowSpec[], startBalance = 100_000): Transaction[] {
  let balance = startBalance;
  return rows.map((row, i) => {
    const fee = row.fee ?? 0;
    balance = balance + row.amount - fee;
    return {
      date: new Date(row.date.replace(' ', 'T')),
      txnId: `TXN${i + 1}`,
      type: row.type,
      counterparty: 'Customer 2507****000',
      amount: row.amount,
      fee,
      balance,
    };
  });
}

describe('integrity check', () => {
  it('detects a balance-chain break at the right row', () => {
    const txns = makeTxns([
      { date: '2026-01-01 09:00', type: 'PAYMENT_RECEIVED', amount: 5000, fee: 25 },
      { date: '2026-01-02 09:00', type: 'PAYMENT_RECEIVED', amount: 3000, fee: 15 },
      { date: '2026-01-03 09:00', type: 'CASH_OUT', amount: -2000, fee: 100 },
    ]);
    txns[1].amount = 9999;

    const report = checkIntegrity(txns);
    expect(report.valid).toBe(false);
    expect(report.brokenRows).toEqual([3]);
  });

  it('builds row audit with expected balance for display', () => {
    const txns = makeTxns([
      { date: '2026-01-01 09:00', type: 'PAYMENT_RECEIVED', amount: 5000, fee: 25 },
      { date: '2026-01-02 09:00', type: 'PAYMENT_RECEIVED', amount: 3000, fee: 15 },
    ]);
    txns[1].balance = 999_999;

    const report = checkIntegrity(txns);
    const audit = buildIntegrityAudit(txns);
    const display = integrityRowsForDisplay(audit, report.brokenRows, 1);

    expect(display.some((r) => r.rowNumber === 3 && !r.balanceOk)).toBe(true);
    expect(display.find((r) => r.rowNumber === 3)?.expectedBalance).not.toBe(999_999);
  });

  it('tolerates a 1 RWF rounding difference', () => {
    const txns = makeTxns([
      { date: '2026-01-01 09:00', type: 'PAYMENT_RECEIVED', amount: 5000 },
      { date: '2026-01-02 09:00', type: 'PAYMENT_RECEIVED', amount: 3000 },
    ]);
    txns[1].balance += 1;
    expect(checkIntegrity(txns).valid).toBe(true);
  });

  it('flags duplicate txn ids and out-of-order dates', () => {
    const txns = makeTxns([
      { date: '2026-01-02 09:00', type: 'PAYMENT_RECEIVED', amount: 5000 },
      { date: '2026-01-01 09:00', type: 'PAYMENT_RECEIVED', amount: 3000 },
    ]);
    txns[1].txnId = txns[0].txnId;

    const report = checkIntegrity(txns);
    expect(report.duplicateIds).toEqual([txns[0].txnId]);
    expect(report.outOfOrderRows).toEqual([3]);
  });
});

describe('monthly aggregation', () => {
  it('counts PAYMENT_RECEIVED fully, TRANSFER_IN at half, and excludes CASH_IN', () => {
    const txns = makeTxns([
      { date: '2026-01-05 09:00', type: 'PAYMENT_RECEIVED', amount: 1000 },
      { date: '2026-01-06 09:00', type: 'TRANSFER_IN', amount: 2000 },
      { date: '2026-01-07 09:00', type: 'CASH_IN', amount: 5000 },
    ]);
    const [jan] = aggregateMonths(txns);
    expect(jan.revenue).toBe(1000 + 0.5 * 2000);
  });
});

describe('verdict bands', () => {
  it('maps 44/45/69/70 to DECLINE/REVIEW/REVIEW/APPROVE', () => {
    expect(verdictForScore(44)).toBe('DECLINE');
    expect(verdictForScore(45)).toBe('REVIEW');
    expect(verdictForScore(69)).toBe('REVIEW');
    expect(verdictForScore(70)).toBe('APPROVE');
  });
});

describe('not scoreable', () => {
  it('returns NOT_SCOREABLE under 3 months of history', () => {
    const rows: RowSpec[] = [];
    for (let day = 1; day <= 25; day++) {
      rows.push({ date: `2026-01-${String(day).padStart(2, '0')} 09:00`, type: 'PAYMENT_RECEIVED', amount: 10_000, fee: 50 });
      rows.push({ date: `2026-02-${String(day).padStart(2, '0')} 09:00`, type: 'PAYMENT_RECEIVED', amount: 10_000, fee: 50 });
    }
    rows.sort((a, b) => a.date.localeCompare(b.date));
    const result = scoreTransactions(makeTxns(rows));
    expect(result.verdict).toBe('NOT_SCOREABLE');
    expect(result.monthlyRepaymentCapacity).toBe(0);
    expect(result.recommendedLimit).toBe(0);
  });
});

describe('stress test scoring', () => {
  it('lowers score and capacity when revenue drops 20%', () => {
    const rows: RowSpec[] = [];
    for (const month of ['01', '02', '03', '04', '05', '06']) {
      for (let day = 1; day <= 20; day++) {
        rows.push({
          date: `2026-${month}-${String(day).padStart(2, '0')} 09:00`,
          type: 'PAYMENT_RECEIVED',
          amount: 50_000,
          fee: 100,
        });
      }
    }
    const baseline = scoreTransactions(makeTxns(rows));
    const stressed = scoreTransactions(makeTxns(rows), { revenueStressPct: 20 });

    expect(stressed.score).toBeLessThan(baseline.score);
    expect(stressed.monthlyRepaymentCapacity).toBeLessThan(baseline.monthlyRepaymentCapacity);
    expect(stressed.stressed).toBe(true);
  });
});

describe('loan assessment', () => {
  const scoreResult: ScoreResult = {
    score: 80,
    verdict: 'APPROVE',
    subs: { inflow: 80, regularity: 80, balanceFloor: 80, volatility: 80, expenseRatio: 80 },
    reasons: [],
    monthlyRepaymentCapacity: 100_000,
    recommendedLimit: 600_000,
    meanMonthlyNet: 240_000,
  };
  const T = 6;
  const r = 0.02;
  const amountForRatio = (ratio: number) => (ratio * 100_000 * T) / (1 + r * T);

  it('returns MATCH at ratio 0.9', () => {
    const a = assessLoan({ amount: amountForRatio(0.9), termMonths: T, monthlyRate: r }, scoreResult);
    expect(a.ratio).toBeCloseTo(0.9, 6);
    expect(a.verdict).toBe('MATCH');
  });

  it('returns STRETCH at ratio 1.1 with a workable counter-offer', () => {
    const a = assessLoan({ amount: amountForRatio(1.1), termMonths: T, monthlyRate: r }, scoreResult);
    expect(a.verdict).toBe('STRETCH');
    expect(a.counterOffer.minTermForAmount).toBe(7);
  });
});
