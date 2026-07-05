import { describe, expect, it } from 'vitest';
import { aggregateMonths, assessLoan, scoreTransactions, verdictForScore } from './engine';
import { checkIntegrity } from './integrity';
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
    txns[1].amount = 9999; // doctor the amount without touching the recorded balance

    const report = checkIntegrity(txns);
    expect(report.valid).toBe(false);
    expect(report.brokenRows).toEqual([3]);
    expect(report.duplicateIds).toEqual([]);
    expect(report.outOfOrderRows).toEqual([]);
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

  it('sums outflows and all fees into expenses and counts selling days', () => {
    const txns = makeTxns([
      { date: '2026-01-05 09:00', type: 'PAYMENT_RECEIVED', amount: 1000, fee: 10 },
      { date: '2026-01-05 15:00', type: 'PAYMENT_RECEIVED', amount: 1000, fee: 10 },
      { date: '2026-01-06 09:00', type: 'CASH_OUT', amount: -3000, fee: 50 },
    ]);
    const [jan] = aggregateMonths(txns);
    expect(jan.expenses).toBe(3000 + 10 + 10 + 50);
    expect(jan.sellingDays).toBe(1);
    expect(jan.net).toBe(jan.revenue - jan.expenses);
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
    expect(result.safeMonthlyPayment).toBe(0);
    expect(result.recommendedLimit).toBe(0);
  });

  it('returns NOT_SCOREABLE under 40 transactions even with enough months', () => {
    const rows: RowSpec[] = [];
    for (const month of ['01', '02', '03', '04']) {
      for (const day of ['05', '12', '19', '26']) {
        rows.push({ date: `2026-${month}-${day} 09:00`, type: 'PAYMENT_RECEIVED', amount: 10_000, fee: 50 });
      }
    }
    const result = scoreTransactions(makeTxns(rows));
    expect(result.verdict).toBe('NOT_SCOREABLE');
  });
});

describe('loan assessment', () => {
  const scoreResult: ScoreResult = {
    score: 80,
    verdict: 'APPROVE',
    subs: { regularity: 80, liquidity: 80, discipline: 80, stability: 80, growth: 80 },
    reasons: [],
    safeMonthlyPayment: 100_000,
    recommendedLimit: 600_000,
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
    expect(a.counterOffer.maxAmountAtTerm).toBeCloseTo((100_000 * T) / (1 + r * T), 6);
    expect(a.counterOffer.minTermForAmount).toBe(7);
  });

  it('returns MISMATCH at ratio 1.4', () => {
    const a = assessLoan({ amount: amountForRatio(1.4), termMonths: T, monthlyRate: r }, scoreResult);
    expect(a.verdict).toBe('MISMATCH');
  });

  it('flags requests far beyond the recommended limit', () => {
    const a = assessLoan({ amount: 10_000_000, termMonths: 12, monthlyRate: r }, scoreResult);
    expect(a.reasons).toContain('requested amount far exceeds what the cashflow evidence supports');
  });
});
