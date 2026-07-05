import type {
  FeatureSet,
  LoanAssessment,
  LoanRequest,
  MonthlyAggregate,
  ScoreResult,
  Transaction,
} from './types';

const NEAR_ZERO_THRESHOLD = 10_000;
const TRADING_DAYS_PER_MONTH = 26;

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

// population standard deviation
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
    // CASH_IN is owner float, never revenue
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

function nearZeroDayShare(txns: Transaction[]): number {
  if (txns.length === 0) return 0;
  // last-seen balance per calendar day, carried forward across days without transactions
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

  // least-squares slope of revenue over month index, relative to mean revenue
  const n = months.length;
  const xMean = (n - 1) / 2;
  const varX = mean(revenues.map((_, i) => (i - xMean) ** 2));
  const covXY = mean(revenues.map((r, i) => (i - xMean) * (r - meanRevenue)));
  const slope = varX === 0 ? 0 : covXY / varX;

  return {
    monthsCovered: n,
    txnCount: txns.length,
    medianMonthlyRevenue: median(revenues),
    medianMonthlyNet: median(nets),
    sellingDaysRatio: mean(months.map((m) => m.sellingDays)) / TRADING_DAYS_PER_MONTH,
    revenueCV: meanRevenue === 0 ? 0 : stdev(revenues) / meanRevenue,
    expenseRatio: median(
      months.map((m) => (m.revenue === 0 ? Number.POSITIVE_INFINITY : m.expenses / m.revenue)),
    ),
    netCV: meanNet === 0 ? 0 : stdev(nets) / meanNet,
    growthRate: meanRevenue === 0 ? 0 : slope / meanRevenue,
    nearZeroDayShare: nearZeroDayShare(txns),
  };
}

export function verdictForScore(score: number): 'APPROVE' | 'REVIEW' | 'DECLINE' {
  if (score >= 70) return 'APPROVE';
  if (score >= 45) return 'REVIEW';
  return 'DECLINE';
}

const fmtRwf = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;
const pct = (x: number) => `${Math.round(x * 100)}%`;

function reasonFor(sub: keyof ScoreResult['subs'], f: FeatureSet, meanNet: number): string {
  switch (sub) {
    case 'regularity': {
      const days = Math.round(clamp(f.sellingDaysRatio, 0, 1) * TRADING_DAYS_PER_MONTH);
      return `Money comes in on ${days} of ${TRADING_DAYS_PER_MONTH} trading days, with month-to-month revenue swings of ${pct(f.revenueCV)}`;
    }
    case 'liquidity':
      return f.nearZeroDayShare === 0
        ? `Balance never fell below ${fmtRwf(NEAR_ZERO_THRESHOLD)}`
        : `Balance sat below ${fmtRwf(NEAR_ZERO_THRESHOLD)} on ${pct(f.nearZeroDayShare)} of days`;
    case 'discipline':
      return Number.isFinite(f.expenseRatio)
        ? `Spending eats ${pct(f.expenseRatio)} of revenue in a typical month`
        : `Spending exceeds revenue in a typical month`;
    case 'stability':
      return meanNet <= 0
        ? `The business loses money in an average month`
        : `Monthly net profit averages ${fmtRwf(meanNet)}, varying ${pct(f.netCV)} month to month`;
    case 'growth': {
      const g = Math.round(f.growthRate * 100);
      if (g > 0) return `Revenue is growing about ${g}% per month`;
      if (g < 0) return `Revenue is shrinking about ${Math.abs(g)}% per month`;
      return `Revenue is flat month over month`;
    }
  }
}

export function scoreTransactions(txns: Transaction[]): ScoreResult {
  const months = aggregateMonths(txns);
  const features = computeFeatures(txns, months);
  const meanNet = mean(months.map((m) => m.net));

  const subs = {
    regularity:
      100 *
      (0.5 * clamp(features.sellingDaysRatio, 0, 1) + 0.5 * (1 - clamp(features.revenueCV, 0, 1))),
    liquidity: 100 * (1 - clamp(5 * features.nearZeroDayShare, 0, 1)),
    discipline:
      features.expenseRatio <= 0.55
        ? 100
        : features.expenseRatio >= 1.0
          ? 0
          : (100 * (1 - features.expenseRatio)) / 0.45,
    stability: meanNet <= 0 ? 0 : 100 * (1 - clamp(features.netCV, 0, 1)),
    growth: clamp(50 + 500 * features.growthRate, 0, 100),
  };

  const score =
    0.25 * subs.regularity +
    0.2 * subs.liquidity +
    0.2 * subs.discipline +
    0.2 * subs.stability +
    0.15 * subs.growth;

  const safeMonthlyPayment = Math.max(0, 0.3 * features.medianMonthlyNet);
  const recommendedLimit = safeMonthlyPayment * 6;

  if (features.monthsCovered < 3 || features.txnCount < 40) {
    return {
      score: 0,
      verdict: 'NOT_SCOREABLE',
      subs,
      reasons: [
        `Only ${features.monthsCovered} month${features.monthsCovered === 1 ? '' : 's'} of history and ${features.txnCount} transactions available; scoring needs at least 3 months and 40 transactions`,
        'Keep receiving customer payments through MoMo so the history builds up',
        'Come back once 3 or more full months of activity are on record',
      ],
      safeMonthlyPayment: 0,
      recommendedLimit: 0,
    };
  }

  // reasons: two strongest sub-scores, then the single weakest
  const ranked = (Object.keys(subs) as (keyof typeof subs)[]).sort((a, b) => subs[b] - subs[a]);
  const reasons = [ranked[0], ranked[1], ranked[ranked.length - 1]].map((sub) =>
    reasonFor(sub, features, meanNet),
  );

  return {
    score: Math.round(score),
    verdict: verdictForScore(score),
    subs,
    reasons,
    safeMonthlyPayment,
    recommendedLimit,
  };
}

export function assessLoan(request: LoanRequest, scoreResult: ScoreResult): LoanAssessment {
  const { amount: A, termMonths: T, monthlyRate: r } = request;
  const capacity = scoreResult.safeMonthlyPayment;

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
