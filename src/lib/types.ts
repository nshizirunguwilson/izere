export type TxnType =
  | 'PAYMENT_RECEIVED'
  | 'TRANSFER_IN'
  | 'CASH_IN'
  | 'TRANSFER_OUT'
  | 'CASH_OUT'
  | 'BILL_PAYMENT'
  | 'AIRTIME';

export interface Transaction {
  date: Date;
  txnId: string;
  type: TxnType;
  counterparty: string;
  amount: number;
  fee: number;
  balance: number;
}

export interface IntegrityReport {
  valid: boolean;
  brokenRows: number[];
  duplicateIds: string[];
  outOfOrderRows: number[];
}

export interface IntegrityRowAudit {
  rowNumber: number;
  date: string;
  description: string;
  type: string;
  amount: number;
  fee: number;
  balance: number;
  expectedBalance: number | null;
  balanceOk: boolean;
}

export interface MonthlyAggregate {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
  sellingDays: number;
}

export interface FeatureSet {
  monthsCovered: number;
  txnCount: number;
  meanMonthlyInflow: number;
  meanMonthlyNet: number;
  sellingDaysRatio: number;
  revenueCV: number;
  expenseRatio: number;
  netCV: number;
  nearZeroDayShare: number;
}

export const SCORE_WEIGHTS = {
  inflow: 0.25,
  regularity: 0.2,
  balanceFloor: 0.2,
  volatility: 0.2,
  expenseRatio: 0.15,
} as const;

export type ScoreSubKey = keyof typeof SCORE_WEIGHTS;

// Structured facts behind each reason sentence. The engine stays language-neutral;
// the active language dictionary renders these into prose at display time.
export type Reason =
  | { key: 'inflow'; mean: number; months: number }
  | { key: 'sellingDays'; days: number; of: number }
  | { key: 'lowBalance'; share: number }
  | { key: 'volatility'; swing: number }
  | { key: 'spending'; ratio: number }
  | { key: 'notEnoughHistory'; months: number; txns: number }
  | { key: 'keepReceivingPayments' }
  | { key: 'comeBackLater' };

export interface ScoreResult {
  score: number;
  verdict: 'APPROVE' | 'REVIEW' | 'DECLINE' | 'NOT_SCOREABLE';
  subs: Record<ScoreSubKey, number>;
  reasons: Reason[];
  monthlyRepaymentCapacity: number;
  recommendedLimit: number;
  meanMonthlyNet: number;
  stressed?: boolean;
  revenueStressPct?: number;
}

export interface LoanRequest {
  amount: number;
  termMonths: number;
  monthlyRate: number;
}

export type LoanReasonKey = 'farExceedsEvidence';

export interface LoanAssessment {
  requestedPayment: number;
  capacity: number;
  ratio: number;
  verdict: 'MATCH' | 'STRETCH' | 'MISMATCH';
  counterOffer: {
    maxAmountAtTerm: number;
    minTermForAmount: number | null;
  };
  reasons: LoanReasonKey[];
}

export interface ScoreOptions {
  revenueStressPct?: number;
}
