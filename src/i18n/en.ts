import type { Reason, ScoreResult, ScoreSubKey } from '../lib/types';

const rwf = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;
const pct = (x: number) => `${Math.round(x * 100)}%`;

export const en = {
  tagline: 'Mobile Money history → lender-ready credit decision',

  nav: {
    menu: 'Menu',
    dashboard: 'Dashboard',
    monthly: 'Monthly summary',
    loan: 'Loan request',
  },

  shell: {
    newStatement: 'New statement',
    exportReport: 'Export report',
  },

  dashboard: {
    scoreLabel: 'Credit score',
    cashflow: 'Monthly cash flow',
    whyTitle: 'Why this decision',
  },

  customers: {
    title: 'Top customers',
    payments: (n: number) => `${n} payments`,
  },

  loan: {
    title: 'Loan request',
    subtitle: 'Does the requested loan fit what the data supports? Simple interest at 2% per month.',
    amount: 'Amount (RWF)',
    term: 'Term (months, 1-24)',
    verdicts: { MATCH: 'Fits', STRETCH: 'Stretch', MISMATCH: 'Does not fit' },
    summary: (payment: number, capacity: number, ratioPct: string) =>
      `Repayment ${rwf(payment)}/month against a safe capacity of ${rwf(capacity)}/month (${ratioPct} of capacity)`,
    fits: 'This request fits the cashflow evidence. No counter-offer needed.',
    counterOffer: (term: number, max: number) =>
      `Counter-offer: at ${term} months the cashflow supports up to ${rwf(max)}`,
    counterKeepTerm: (amount: number, minTerm: number) =>
      `, or keep ${rwf(amount)} by extending the term to ${minTerm} months.`,
    counterNoTerm: (amount: number) => `; no term up to 24 months makes ${rwf(amount)} affordable.`,
    reason: {
      farExceedsEvidence: 'Requested amount far exceeds what the cashflow evidence supports',
    },
  },

  upload: {
    drop: 'Drop a MoMo statement CSV here',
    columns: 'date, txn_id, type, counterparty, amount, fee, balance',
    choose: 'Choose file',
    orSample: 'Or load a sample:',
    samples: {
      healthy: 'Healthy retail shop',
      seasonal: 'Seasonal trader',
      tampered: 'Tampered statement',
    },
  },

  parseErrorTitle: (name: string) => `Could not read ${name}`,

  integrity: {
    failTitle: 'Statement failed the integrity check, no score will be issued',
    brokenRows: (rows: string, plural: boolean) =>
      `Balance chain breaks at row${plural ? 's' : ''} ${rows}: the recorded balance does not match the previous balance plus this transaction.`,
    duplicates: (ids: string) => `Duplicate transaction IDs: ${ids}`,
    outOfOrder: (rows: string, plural: boolean) =>
      `Transactions out of chronological order at row${plural ? 's' : ''} ${rows}`,
    advice:
      'This statement appears edited or incomplete. Ask the business for a fresh export before assessing.',
    verified: (name: string, count: number) =>
      `${name} verified: ${count} transactions, balance chain intact, no duplicates, dates in order.`,
    table: {
      row: 'Row',
      date: 'Date',
      description: 'Description',
      type: 'Type',
      amount: 'Amount',
      expected: 'Expected balance',
      recorded: 'Recorded balance',
      hidden: (n: number) => `… ${n} rows hidden …`,
      mismatch: (off: number) => `mismatch: ${rwf(off)} off`,
    },
  },

  verdict: {
    APPROVE: 'Approve',
    REVIEW: 'Review',
    DECLINE: 'Decline',
    NOT_SCOREABLE: 'Not scoreable yet',
  } satisfies Record<ScoreResult['verdict'], string>,

  subs: {
    inflow: 'Avg monthly inflow',
    regularity: 'Inflow regularity',
    balanceFloor: 'Balance floor',
    volatility: 'Volatility',
    expenseRatio: 'Expense-to-income',
  } satisfies Record<ScoreSubKey, string>,

  results: {
    title: (name: string) => `Credit decision: ${name}`,
    of100: 'of 100',
    baseline: (score: number, verdict: string) => `Baseline: ${score} (${verdict})`,
    recommendedLimit: 'Recommended limit',
    limitFormula: (multiplier: number, mean: number) =>
      `${multiplier}× average monthly net inflow (${rwf(mean)})`,
    capacity: (x: number) => `Monthly repayment capacity: ${rwf(x)}`,
    responsible: 'Responsible lending: capped at 30% of net monthly inflow',
    weightsNote: 'Illustrative weights (25 / 20 / 20 / 20 / 15). Production model trains on outcomes.',
    showSummary: 'Show monthly summary',
    hideSummary: 'Hide monthly summary',
    monthlySummary: 'Monthly summary',
    table: {
      month: 'Month',
      inflow: 'Inflow',
      expenses: 'Expenses',
      net: 'Net',
      sellingDays: 'Selling days',
    },
    notScoreable: 'Not scoreable yet',
    notScoreableSub:
      'There is not enough history to score this business fairly. This is not a decline.',
  },

  stress: {
    title: 'Stress test',
    subtitle: 'If revenue drops, can they still repay? Adjust to recompute live.',
    shock: 'Revenue shock',
    stressedScore: 'Stressed score',
    capacity: 'Repayment capacity',
    limit: 'Recommended limit',
    perMonth: '/mo',
  },

  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],

  reason: (r: Reason): string => {
    switch (r.key) {
      case 'inflow':
        return `Average monthly inflow is ${rwf(r.mean)} across ${r.months} months`;
      case 'sellingDays':
        return `Customer payments arrive on ${r.days} of ${r.of} trading days per month`;
      case 'lowBalance':
        return r.share === 0
          ? `Balance stayed above ${rwf(10_000)} throughout the period`
          : `Balance fell below ${rwf(10_000)} on ${pct(r.share)} of days`;
      case 'volatility':
        return `Month-to-month inflow swings by ${pct(r.swing)} on average`;
      case 'spending':
        return Number.isFinite(r.ratio)
          ? `Typical month spends ${pct(r.ratio)} of inflow on expenses and fees`
          : `Expenses exceed inflow in a typical month`;
      case 'notEnoughHistory':
        return `Only ${r.months} month${r.months === 1 ? '' : 's'} of history and ${r.txns} transactions available; scoring needs at least 3 months and 40 transactions`;
      case 'keepReceivingPayments':
        return 'Keep receiving customer payments through MoMo so the history builds up';
      case 'comeBackLater':
        return 'Come back once 3 or more full months of activity are on record';
    }
  },
};

export type Dict = typeof en;
