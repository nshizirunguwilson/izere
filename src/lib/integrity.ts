import type { IntegrityReport, Transaction } from './types';

// Row numbers are 1-indexed counting the header line, so data row i maps to row i + 2.
export function checkIntegrity(txns: Transaction[]): IntegrityReport {
  const brokenRows: number[] = [];
  const outOfOrderRows: number[] = [];
  const idCounts = new Map<string, number>();

  txns.forEach((txn, i) => {
    idCounts.set(txn.txnId, (idCounts.get(txn.txnId) ?? 0) + 1);
    if (i === 0) return;
    const prev = txns[i - 1];
    const expected = prev.balance + txn.amount - txn.fee;
    if (Math.abs(expected - txn.balance) > 1) {
      brokenRows.push(i + 2);
    }
    if (txn.date.getTime() < prev.date.getTime()) {
      outOfOrderRows.push(i + 2);
    }
  });

  const duplicateIds = [...idCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  return {
    valid: brokenRows.length === 0 && duplicateIds.length === 0 && outOfOrderRows.length === 0,
    brokenRows,
    duplicateIds,
    outOfOrderRows,
  };
}
