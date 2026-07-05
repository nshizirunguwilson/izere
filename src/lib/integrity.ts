import type { IntegrityReport, IntegrityRowAudit, Transaction } from './types';

// Calendar-day granularity: MoMo confirmations can arrive minutes out of order
// within a day, so only a step back to an earlier day counts as out of order.
const dayNumber = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const fmtDate = (d: Date) =>
  d.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

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
    if (dayNumber(txn.date) < dayNumber(prev.date)) {
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

export function buildIntegrityAudit(txns: Transaction[]): IntegrityRowAudit[] {
  return txns.map((txn, i) => {
    const rowNumber = i + 2;
    const expectedBalance = i === 0 ? null : txns[i - 1].balance + txn.amount - txn.fee;
    const balanceOk =
      expectedBalance === null ? true : Math.abs(expectedBalance - txn.balance) <= 1;

    return {
      rowNumber,
      date: fmtDate(txn.date),
      description: txn.counterparty,
      type: txn.type,
      amount: txn.amount,
      fee: txn.fee,
      balance: txn.balance,
      expectedBalance,
      balanceOk,
    };
  });
}

/** Rows to show in the integrity table: context around each broken row. */
export function integrityRowsForDisplay(
  audit: IntegrityRowAudit[],
  brokenRows: number[],
  context = 3,
): IntegrityRowAudit[] {
  if (brokenRows.length === 0) return audit.slice(0, Math.min(8, audit.length));

  const indices = new Set<number>();
  for (const rowNumber of brokenRows) {
    const idx = audit.findIndex((r) => r.rowNumber === rowNumber);
    if (idx === -1) continue;
    for (let j = Math.max(0, idx - context); j <= Math.min(audit.length - 1, idx + context); j++) {
      indices.add(j);
    }
  }

  return [...indices].sort((a, b) => a - b).map((i) => audit[i]);
}
