import type {
  FeatureSet,
  LoanAssessment,
  LoanRequest,
  MonthlyAggregate,
  Reason,
  ScoreOptions,
  ScoreResult,
  ScoreSubKey,
  Transaction,
} from './types';
import { SCORE_WEIGHTS } from './types';

const NEAR_ZERO_THRESHOLD = 10_000;
const TRADING_DAYS_PER_MONTH = 26;
// Illustrative benchmark for MSME monthly inflow; real model trains on outcomes in sandbox.
const INFLOW_BENCHMARK = 5_800_000;
const LIMIT_MULTIPLIER = 2.5;
const REPAYMENT_CAP_RATIO = 0.3;

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

const stdev = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

const median = (xs: number[]) => {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const dayKey = (d: Date) =>
  `${monthKey(d)}-${String(d.getDate()).padStart(2, '0')}`;

export function aggregateMonths(txns: Transaction[]): MonthlyAggregate[] {
  const months = new Map<
    string,
    { revenue: number; expenses: number; sellingDays: Set<string> }
  >();

  for (const txn of txns) {
    const key = monthKey(txn.date);
    let m = months.get(key);
    if (!m) {
      m = { revenue: 0, expenses: 0, sellingDays: new Set() };
      months.set(key, m);
    }
    if (txn.type === 'PAYMENT_RECEIVED') {
      m.revenue += txn.amount;
      m.sellingDays.add(dayKey(txn.date));
    } else if (txn.type === 'TRANSFER_IN') {
      m.revenue += 0.5 * txn.amount;
    }
    if (txn.amount < 0) {
      m.expenses += Math.abs(txn.amount);
    }
    m.expenses += txn.fee;
  }

  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, m]) => ({
      month,
      revenue: m.revenue,
      expenses: m.expenses,
      net: m.revenue - m.expenses,
      sellingDays: m.sellingDays.size,
    }));
}

function applyRevenueStress(months: MonthlyAggregate[], stressPct: number): MonthlyAggregate[] {
  const factor = 1 - stressPct / 100;
  return months.map((m) => ({
    ...m,
    revenue: m.revenue * factor,
    net: m.revenue * factor - m.expenses,
  }));
}

function nearZeroDayShare(txns: Transaction[]): number {
  if (txns.length === 0) return 0;
  const lastBalanceByDay = new Map<string, number>();
  for (const txn of txns) {
    lastBalanceByDay.set(dayKey(txn.date), txn.balance);
  }
  const first = txns[0].date;
  const last = txns[txns.length - 1].date;
  const cursor = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  const end = new Date(last.getFullYear(), last.getMonth(), last.getDate());

  let days = 0;
  let nearZeroDays = 0;
  let balance = txns[0].balance;
  while (cursor.getTime() <= end.getTime()) {
    balance = lastBalanceByDay.get(dayKey(cursor)) ?? balance;
    days += 1;
    if (balance < NEAR_ZERO_THRESHOLD) nearZeroDays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  return nearZeroDays / days;
}

export function computeFeatures(txns: Transaction[], months: MonthlyAggregate[]): FeatureSet {
  const revenues = months.map((m) => m.revenue);
  const nets = months.map((m) => m.net);
  const meanRevenue = mean(revenues);
  const meanNet = mean(nets);

  return {
    monthsCovered: months.length,
    txnCount: txns.length,
    meanMonthlyInflow: meanRevenue,
    meanMonthlyNet: meanNet,
    sellingDaysRatio: mean(months.map((m) => m.sellingDays)) / TRADING_DAYS_PER_MONTH,
    revenueCV: meanRevenue === 0 ? 0 : stdev(revenues) / meanRevenue,
    expenseRatio: median(
      months.map((m) => (m.revenue === 0 ? Number.POSITIVE_INFINITY : m.expenses / m.revenue)),
    ),
    netCV: meanNet <= 0 ? 0 : stdev(nets) / meanNet,
    nearZeroDayShare: nearZeroDayShare(txns),
  };
}

export function verdictForScore(score: number): 'APPROVE' | 'REVIEW' | 'DECLINE' {
  if (score >= 70) return 'APPROVE';
  if (score >= 45) return 'REVIEW';
  return 'DECLINE';
}

function computeSubs(features: FeatureSet): Record<ScoreSubKey, number> {
  const rawInflow = clamp(100 * (features.meanMonthlyInflow / INFLOW_BENCHMARK), 0, 100);
  const inflow = rawInflow * (features.meanMonthlyNet > 0 ? 1 : 0.55);

  return {
    inflow,
    regularity:
      100 *
      (0.5 * clamp(features.sellingDaysRatio, 0, 1) +
        0.5 * (1 - clamp(features.revenueCV, 0, 1))),
    balanceFloor: 100 * (1 - clamp(5 * features.nearZeroDayShare, 0, 1)),
    volatility:
      features.meanMonthlyNet <= 0
        ? 0
        : 100 * (1 - clamp(features.netCV, 0, 1)),
    expenseRatio:
      features.expenseRatio <= 0.55
        ? 100
        : features.expenseRatio >= 1.0
          ? 0
          : (100 * (1 - features.expenseRatio)) / 0.45,
  };
}

function blendScore(subs: Record<ScoreSubKey, number>): number {
  return (
    SCORE_WEIGHTS.inflow * subs.inflow +
    SCORE_WEIGHTS.regularity * subs.regularity +
    SCORE_WEIGHTS.balanceFloor * subs.balanceFloor +
    SCORE_WEIGHTS.volatility * subs.volatility +
    SCORE_WEIGHTS.expenseRatio * subs.expenseRatio
  );
}

function reasonFor(sub: ScoreSubKey, f: FeatureSet): Reason {
  switch (sub) {
    case 'inflow':
      return { key: 'inflow', mean: f.meanMonthlyInflow, months: f.monthsCovered };
    case 'regularity':
      return {
        key: 'sellingDays',
        days: Math.round(clamp(f.sellingDaysRatio, 0, 1) * TRADING_DAYS_PER_MONTH),
        of: TRADING_DAYS_PER_MONTH,
      };
    case 'balanceFloor':
      return { key: 'lowBalance', share: f.nearZeroDayShare };
    case 'volatility':
      return { key: 'volatility', swing: f.revenueCV };
    case 'expenseRatio':
      return { key: 'spending', ratio: f.expenseRatio };
  }
}

function topReasons(subs: Record<ScoreSubKey, number>, features: FeatureSet): Reason[] {
  const ranked = (Object.keys(subs) as ScoreSubKey[]).sort(
    (a, b) => SCORE_WEIGHTS[b] * subs[b] - SCORE_WEIGHTS[a] * subs[a],
  );
  return ranked.slice(0, 3).map((sub) => reasonFor(sub, features));
}

export function scoreTransactions(txns: Transaction[], options: ScoreOptions = {}): ScoreResult {
  const stressPct = options.revenueStressPct ?? 0;
  let months = aggregateMonths(txns);
  if (stressPct > 0) {
    months = applyRevenueStress(months, stressPct);
  }

  const features = computeFeatures(txns, months);
  const subs = computeSubs(features);
  const score = blendScore(subs);
  const monthlyRepaymentCapacity = Math.max(0, REPAYMENT_CAP_RATIO * features.meanMonthlyNet);
  const recommendedLimit = Math.max(0, LIMIT_MULTIPLIER * features.meanMonthlyNet);

  if (features.monthsCovered < 3 || features.txnCount < 40) {
    return {
      score: 0,
      verdict: 'NOT_SCOREABLE',
      reasons: [
        { key: 'notEnoughHistory', months: features.monthsCovered, txns: features.txnCount },
        { key: 'keepReceivingPayments' },
        { key: 'comeBackLater' },
      ],
      subs,
      monthlyRepaymentCapacity: 0,
      recommendedLimit: 0,
      meanMonthlyNet: features.meanMonthlyNet,
    };
  }

  return {
    score: Math.round(score),
    verdict: verdictForScore(score),
    reasons: topReasons(subs, features),
    subs,
    monthlyRepaymentCapacity,
    recommendedLimit,
    meanMonthlyNet: features.meanMonthlyNet,
    ...(stressPct > 0 ? { stressed: true, revenueStressPct: stressPct } : {}),
  };
}

export function assessLoan(request: LoanRequest, scoreResult: ScoreResult): LoanAssessment {
  const { amount: A, termMonths: T, monthlyRate: r } = request;
  const capacity = scoreResult.monthlyRepaymentCapacity;

  const requestedPayment = (A * (1 + r * T)) / T;
  const ratio = capacity > 0 ? requestedPayment / capacity : Number.POSITIVE_INFINITY;

  const verdict = ratio <= 1.0 ? 'MATCH' : ratio <= 1.25 ? 'STRETCH' : 'MISMATCH';

  const maxAmountAtTerm = (capacity * T) / (1 + r * T);
  let minTermForAmount: number | null = null;
  for (let t = 1; t <= 24; t++) {
    if ((A * (1 + r * t)) / t <= capacity) {
      minTermForAmount = t;
      break;
    }
  }

  const reasons: string[] = [];
  if (A > 4 * scoreResult.recommendedLimit) {
    reasons.push('requested amount far exceeds what the cashflow evidence supports');
  }

  return {
    requestedPayment,
    capacity,
    ratio,
    verdict,
    counterOffer: { maxAmountAtTerm, minTermForAmount },
    reasons,
  };
}

export function topCustomers(
  txns: Transaction[],
  limit = 5,
): { counterparty: string; total: number; count: number }[] {
  const totals = new Map<string, { total: number; count: number }>();
  for (const txn of txns) {
    if (txn.type !== 'PAYMENT_RECEIVED') continue;
    const entry = totals.get(txn.counterparty) ?? { total: 0, count: 0 };
    entry.total += txn.amount;
    entry.count += 1;
    totals.set(txn.counterparty, entry);
  }
  return [...totals.entries()]
    .map(([counterparty, v]) => ({ counterparty, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
