import type { Reason, ScoreResult, ScoreSubKey } from '../lib/types';

const rwf = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;
const pct = (x: number) => `${Math.round(x * 100)}%`;

export type TipContent = { title: string; body: string; example?: string };

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
    scoreBreakdown: 'Score breakdown',
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
    payTitle: 'What they will pay',
    payMonthly: 'Monthly payment',
    payInterest: 'Total interest',
    payTotal: 'Total to repay',
    payMonths: (n: number) => `over ${n} month${n === 1 ? '' : 's'}`,
    summary: (payment: number, capacity: number, ratioPct: string) =>
      `Repayment ${rwf(payment)}/month against a safe capacity of ${rwf(capacity)}/month (${ratioPct} of capacity)`,
    fits: 'This request fits the cashflow evidence. No counter-offer needed.',
    counterOffer: (term: number, max: number) =>
      `Counter-offer: at ${term} months the cashflow supports up to ${rwf(max)}`,
    counterKeepTerm: (amount: number, minTerm: number) =>
      `, or keep ${rwf(amount)} by extending the term to ${minTerm} months.`,
    counterNoTerm: (amount: number) => `; no term up to 24 months makes ${rwf(amount)} affordable.`,
    invalidAmount: 'Enter an amount greater than 0.',
    invalidTerm: 'The term must be a whole number between 1 and 24 months.',
    termInYears: (months: number) => {
      const y = Math.floor(months / 12);
      const m = months % 12;
      const years = y === 1 ? '1 year' : `${y} years`;
      const rest = m === 1 ? '1 month' : `${m} months`;
      return m === 0 ? `That is ${years}.` : `That is ${years} and ${rest}.`;
    },
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
      established: 'Established business (15 months)',
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
      auditTitle: 'Balance audit',
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

  tips: {
    helpLabel: 'Help',
    exampleLabel: 'Example',

    app: {
      title: 'What is Izere?',
      body: 'Izere reads a business MoMo statement and turns it into a credit score, a safe loan limit, and plain reasons a bank can trust.',
      example: 'A shop uploads 6 months of MoMo CSV. Izere says Approve, limit RWF 2.5M, and explains why in simple words.',
    },
    upload: {
      title: 'Upload a statement',
      body: 'Drop or choose a CSV file exported from Mobile Money. We read it in your browser only. Nothing is sent to a server.',
      example: 'Export from MTN MoMo or Airtel Money, then upload the file here.',
    },
    uploadColumns: {
      title: 'Required columns',
      body: 'Each row is one transaction. The file needs date, ID, type, who paid, amount, fee, and balance after the transaction.',
      example: '2026-01-05, TXN001, PAYMENT_RECEIVED, Customer, 15000, 75, 250000',
    },
    sampleHealthy: {
      title: 'Healthy retail shop',
      body: 'A demo business with steady sales, good balance, and clean records. Use this to show a strong Approve decision.',
    },
    sampleSeasonal: {
      title: 'Seasonal trader',
      body: 'A demo business with ups and downs across months. Use this to show a Review decision, not a hard decline.',
    },
    sampleEstablished: {
      title: 'Established business',
      body: 'A hardware shop with 15 months of history, steady growth and a rainy-season dip. Shows how the score looks with a long track record spanning two years.',
      example: 'More months of evidence means the lender can trust the averages more.',
    },
    sampleTampered: {
      title: 'Tampered statement',
      body: 'A demo file where someone changed numbers but the running balance no longer adds up. Use this to show fraud detection.',
      example: 'Row 692 shows a balance that does not match the math from the row before it.',
    },
    parseError: {
      title: 'File could not be read',
      body: 'The CSV is missing columns, has bad dates, or uses unknown transaction types. Fix the file or try a sample.',
    },
    integrityFail: {
      title: 'Integrity check failed',
      body: 'We replay every transaction and check that balance = previous balance + amount − fee. If that breaks, the file may be edited and we do not score it.',
      example: 'Someone inflates income but forgets to fix the balance column. We catch the exact row.',
    },
    integrityTable: {
      title: 'Balance audit table',
      body: 'These rows show where the math stopped matching. Expected balance is what we calculate. Recorded balance is what the file says.',
    },
    integrityExpected: {
      title: 'Expected balance',
      body: 'What the balance should be if you add this transaction to the previous row’s balance and subtract the fee.',
    },
    integrityRecorded: {
      title: 'Recorded balance',
      body: 'What the CSV file claims the balance was. If this differs from expected, the row is flagged in red.',
    },
    verified: {
      title: 'Statement verified',
      body: 'Every balance links to the next, dates are in order, and there are no duplicate transaction IDs. Safe to score.',
    },
    exportReport: {
      title: 'Export report',
      body: 'Print or save the current page as PDF for your records or to share with a loan officer.',
    },
    newStatement: {
      title: 'New statement',
      body: 'Clear the current file and upload a different business or a fresh export.',
    },
    langToggle: {
      title: 'Language',
      body: 'Switch between English and Kinyarwanda. Help text follows the language you pick.',
    },
    navDashboard: {
      title: 'Dashboard',
      body: 'The main credit decision: score, verdict, loan limit, repayment capacity, and top reasons.',
    },
    navMonthly: {
      title: 'Monthly summary',
      body: 'Month-by-month inflow, spending, profit, and how many days the business took payments.',
    },
    navLoan: {
      title: 'Loan request',
      body: 'Enter an amount and term to see if the requested loan fits what the MoMo data supports.',
      example: 'Ask for RWF 2M over 6 months. Izere compares the monthly payment to safe repayment capacity.',
    },
    creditScore: {
      title: 'Credit score',
      body: 'A number from 0 to 100 built from five MoMo signals. Higher means stronger cashflow evidence. Weights shown are illustrative for the demo.',
      example: 'Score 85 with Approve means the business looks ready for a typical working-capital loan.',
    },
    verdict: {
      title: 'Verdict',
      body: 'Approve (70+): strong case. Review (45–69): needs a human look. Decline (below 45): weak cashflow evidence. Not scoreable: not enough history yet.',
      example: 'Review does not mean no. It means the lender should ask a few more questions.',
    },
    recommendedLimit: {
      title: 'Recommended limit',
      body: 'The biggest total loan we suggest: 2.5 months of profit. Profit means money in minus money out. A loan this size, paid at 30% of profit per month, is fully repaid in about 9 months — comfortable for a small business.',
      example: 'Profit RWF 1,000,000/month → limit 2.5 × 1,000,000 = RWF 2,500,000 total.',
    },
    repaymentCapacity: {
      title: 'Repayment capacity',
      body: 'The most we think they can pay back each month without strain, capped at 30% of average monthly net inflow.',
      example: 'Net RWF 500k/month → capacity about RWF 150k/month.',
    },
    responsibleLending: {
      title: 'Responsible lending',
      body: 'We never suggest a monthly payment above 30% of net inflow. This protects the borrower from over-borrowing.',
    },
    whyDecision: {
      title: 'Why this decision',
      body: 'The three biggest drivers behind the score, written in plain language so a loan officer can explain them to the client.',
    },
    scoreBreakdown: {
      title: 'Score breakdown',
      body: 'Five factors blended into the total score. Each bar is 0–100 for that factor. Percentages are demo weights, not a trained model.',
    },
    subInflow: {
      title: 'Average monthly inflow',
      body: 'How much customer money arrives per month on average. More steady inflow usually means a safer borrower.',
    },
    subRegularity: {
      title: 'Inflow regularity',
      body: 'How often payments arrive across trading days. A shop paid on 20 days/month scores better than one paid on 5 days.',
    },
    subBalanceFloor: {
      title: 'Balance floor',
      body: 'How often the MoMo wallet stayed above a low floor (RWF 10,000). Running near zero often means cash stress.',
    },
    subVolatility: {
      title: 'Volatility',
      body: 'How much monthly inflow jumps up and down. Steady months score better than wild swings.',
      example: 'Harvest income in March and almost nothing in April lowers this score.',
    },
    subExpenseRatio: {
      title: 'Expense-to-income',
      body: 'Typical share of inflow spent on costs and fees. Keeping more of what comes in is healthier.',
      example: 'Spending 50% of inflow on stock and rent is fine; spending 110% means losses.',
    },
    cashflowChart: {
      title: 'Monthly cash flow',
      body: 'Bar height shows money received each month. Use it to spot quiet months or growth at a glance.',
    },
    topCustomers: {
      title: 'Top customers',
      body: 'Who paid the business the most through MoMo. Helps a lender see if income depends on one big buyer.',
      example: 'If 80% comes from one customer, losing them would hurt repayment.',
    },
    stressTest: {
      title: 'Stress test',
      body: 'Asks: what if sales drop but costs stay the same? Everything is recalculated with lower sales so you can see if the loan still fits in a bad season.',
      example: 'Sales RWF 5,000,000, costs RWF 4,000,000 → profit RWF 1,000,000. At −20%, sales fall to 4,000,000 and profit becomes 0: no loan fits.',
    },
    notScoreable: {
      title: 'Not scoreable yet',
      body: 'Less than 3 months or fewer than 40 transactions. We wait for more history instead of guessing.',
      example: 'A new shop with only 6 weeks of MoMo activity gets this message, not a decline.',
    },
    monthlySummary: {
      title: 'Monthly summary table',
      body: 'Each row is one calendar month from the statement. Use it to check the numbers behind the score.',
    },
    colMonth: {
      title: 'Month',
      body: 'Calendar month grouped from all transactions in that period.',
    },
    colInflow: {
      title: 'Inflow',
      body: 'Customer payments and half of transfer-ins counted as business income. Owner cash top-ups are excluded.',
    },
    colExpenses: {
      title: 'Expenses',
      body: 'Money sent out plus transaction fees in that month.',
    },
    colNet: {
      title: 'Net',
      body: 'Inflow minus expenses for the month. This is what the business actually kept.',
      example: 'Inflow RWF 800k, expenses RWF 500k → net RWF 300k.',
    },
    colSellingDays: {
      title: 'Selling days',
      body: 'Days in that month when at least one customer payment was received.',
    },
    loanRequest: {
      title: 'Loan request check',
      body: 'Compares the monthly payment on the requested loan to safe repayment capacity from the statement.',
    },
    loanAmount: {
      title: 'Loan amount',
      body: 'Total money the business wants to borrow, in RWF.',
      example: 'RWF 2,000,000 working capital for stock.',
    },
    loanTerm: {
      title: 'Loan term',
      body: 'How many months to repay. Longer term means smaller monthly payments. Capped at 24 months because a MoMo statement shows a few months of history — it can support a short working-capital loan, not a multi-year commitment.',
      example: 'RWF 2,000,000 over 12 months instead of 6 lowers each monthly installment.',
    },
    loanVerdict: {
      title: 'Fit verdict',
      body: 'Fits: payment is within capacity. Stretch: slightly above but a counter-offer may work. Does not fit: payment is too high for the cashflow we see.',
    },
  },

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
export type TipKey = Exclude<keyof Dict['tips'], 'helpLabel' | 'exampleLabel'>;
