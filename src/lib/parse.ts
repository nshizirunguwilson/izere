import Papa from 'papaparse';
import type { Transaction, TxnType } from './types';

const TXN_TYPES: ReadonlySet<string> = new Set([
  'PAYMENT_RECEIVED',
  'TRANSFER_IN',
  'CASH_IN',
  'TRANSFER_OUT',
  'CASH_OUT',
  'BILL_PAYMENT',
  'AIRTIME',
]);

interface RawRow {
  date: string;
  txn_id: string;
  type: string;
  counterparty: string;
  amount: string;
  fee: string;
  balance: string;
}

export class ParseError extends Error {}

export function parseCsv(text: string): Transaction[] {
  const result = Papa.parse<RawRow>(text.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const missing = ['date', 'txn_id', 'type', 'counterparty', 'amount', 'fee', 'balance'].filter(
    (f) => !result.meta.fields?.includes(f),
  );
  if (missing.length > 0) {
    throw new ParseError(`CSV is missing required columns: ${missing.join(', ')}`);
  }

  return result.data.map((row, i) => {
    const date = new Date(row.date.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) {
      throw new ParseError(`Row ${i + 2}: invalid date "${row.date}"`);
    }
    if (!TXN_TYPES.has(row.type)) {
      throw new ParseError(`Row ${i + 2}: unknown transaction type "${row.type}"`);
    }
    const amount = Number(row.amount);
    const fee = Number(row.fee);
    const balance = Number(row.balance);
    if (Number.isNaN(amount) || Number.isNaN(fee) || Number.isNaN(balance)) {
      throw new ParseError(`Row ${i + 2}: amount, fee and balance must be numbers`);
    }
    return {
      date,
      txnId: row.txn_id,
      type: row.type as TxnType,
      counterparty: row.counterparty,
      amount,
      fee,
      balance,
    };
  });
}
