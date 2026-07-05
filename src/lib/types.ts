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
  medianMonthlyRevenue: number;
  medianMonthlyNet: number;
  sellingDaysRatio: number;
  revenueCV: number;
  expenseRatio: number;
  netCV: number;
  growthRate: number;
  nearZeroDayShare: number;
}

export interface ScoreResult {
  score: number;
  verdict: 'APPROVE' | 'REVIEW' | 'DECLINE' | 'NOT_SCOREABLE';
  subs: {
    regularity: number;
    liquidity: number;
    discipline: number;
    stability: number;
    growth: number;
  };
  reasons: string[];
  safeMonthlyPayment: number;
  recommendedLimit: number;
}

export interface LoanRequest {
  amount: number;
  termMonths: number;
  monthlyRate: number; // default rate 0.02
}

export interface LoanAssessment {
  requestedPayment: number;
  capacity: number;
  ratio: number;
  verdict: 'MATCH' | 'STRETCH' | 'MISMATCH';
  counterOffer: {
    maxAmountAtTerm: number;
    minTermForAmount: number | null;
  };
  reasons: string[];
}
