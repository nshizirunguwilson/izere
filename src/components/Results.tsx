import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleHelp,
  Printer,
  Scale,
  Users,
  Wallet,
} from 'lucide-react';
import { aggregateMonths, assessLoan, scoreTransactions, topCustomers } from '../lib/engine';
import type { LoanAssessment, ScoreResult, Transaction } from '../lib/types';

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

const VERDICT_STYLE: Record<ScoreResult['verdict'], { stroke: string; chip: string; label: string }> = {
  APPROVE: { stroke: '#059669', chip: 'bg-emerald-100 text-emerald-800', label: 'Approve' },
  REVIEW: { stroke: '#d97706', chip: 'bg-amber-100 text-amber-800', label: 'Review' },
  DECLINE: { stroke: '#dc2626', chip: 'bg-red-100 text-red-800', label: 'Decline' },
  NOT_SCOREABLE: { stroke: '#64748b', chip: 'bg-slate-100 text-slate-700', label: 'Not scoreable yet' },
};

const LOAN_VERDICT_STYLE: Record<LoanAssessment['verdict'], string> = {
  MATCH: 'bg-emerald-100 text-emerald-800',
  STRETCH: 'bg-amber-100 text-amber-800',
  MISMATCH: 'bg-red-100 text-red-800',
};

function Gauge({ score, verdict }: { score: number; verdict: ScoreResult['verdict'] }) {
  const arcLength = Math.PI * 80;
  return (
    <svg viewBox="0 0 200 112" className="w-52">
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke={VERDICT_STYLE[verdict].stroke}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * arcLength} ${arcLength}`}
      />
      <text x="100" y="84" textAnchor="middle" fontSize="36" fontWeight="800" fill="#0f172a">
        {score}
      </text>
      <text x="100" y="104" textAnchor="middle" fontSize="11" fill="#64748b">
        of 100
      </text>
    </svg>
  );
}

function SubScores({ subs }: { subs: ScoreResult['subs'] }) {
  const entries: [string, number][] = [
    ['Regularity', subs.regularity],
    ['Liquidity', subs.liquidity],
    ['Discipline', subs.discipline],
    ['Stability', subs.stability],
    ['Growth', subs.growth],
  ];
  return (
    <div className="space-y-2">
      {entries.map(([label, value]) => (
        <div key={label} className="flex items-center gap-3 text-sm">
          <span className="w-24 text-slate-500">{label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.round(value)}%` }}
            />
          </div>
          <span className="w-8 text-right font-semibold tabular-nums">{Math.round(value)}</span>
        </div>
      ))}
    </div>
  );
}

function LoanForm({ score }: { score: ScoreResult }) {
  const [amount, setAmount] = useState('2000000');
  const [term, setTerm] = useState('6');

  const assessment = useMemo(() => {
    const a = Number(amount);
    const t = Number(term);
    if (!(a > 0) || !Number.isInteger(t) || t < 1 || t > 24) return null;
    return assessLoan({ amount: a, termMonths: t, monthlyRate: 0.02 }, score);
  }, [amount, term, score]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 font-bold">
        <Scale size={18} className="text-emerald-700" /> Loan request
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Does what they ask for fit what the data supports? Simple interest at 2% per month.
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Amount (RWF)</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-44 rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">Term (months, 1–24)</span>
          <input
            type="number"
            min="1"
            max="24"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 focus:border-emerald-600 focus:outline-none"
          />
        </label>
      </div>

      {assessment && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold ${LOAN_VERDICT_STYLE[assessment.verdict]}`}
            >
              {assessment.verdict}
            </span>
            <span className="text-sm text-slate-600">
              Repayment {fmt(assessment.requestedPayment)}/month against a safe capacity of{' '}
              {fmt(assessment.capacity)}/month ({(assessment.ratio * 100).toFixed(0)}% of capacity)
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-700">
            {assessment.verdict === 'MATCH' ? (
              <>This request fits the cashflow evidence. No counter-offer needed.</>
            ) : (
              <>
                Counter-offer: at {term} months the cashflow supports up to{' '}
                <span className="font-semibold">{fmt(assessment.counterOffer.maxAmountAtTerm)}</span>
                {assessment.counterOffer.minTermForAmount !== null ? (
                  <>
                    , or keep {fmt(Number(amount))} by extending the term to{' '}
                    <span className="font-semibold">
                      {assessment.counterOffer.minTermForAmount} months
                    </span>
                    .
                  </>
                ) : (
                  <>; no term up to 24 months makes {fmt(Number(amount))} affordable.</>
                )}
              </>
            )}
          </p>
          {assessment.reasons.map((reason) => (
            <p key={reason} className="mt-2 text-sm font-medium text-red-700">
              ⚠ {reason.charAt(0).toUpperCase() + reason.slice(1)}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Results({ txns, sourceName }: { txns: Transaction[]; sourceName: string }) {
  const months = useMemo(() => aggregateMonths(txns), [txns]);
  const score = useMemo(() => scoreTransactions(txns), [txns]);
  const customers = useMemo(() => topCustomers(txns), [txns]);
  const maxRevenue = Math.max(...months.map((m) => m.revenue));

  if (score.verdict === 'NOT_SCOREABLE') {
    return (
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-3">
          <CircleHelp className="text-slate-400" size={28} />
          <div>
            <h2 className="text-lg font-bold">Not scoreable yet</h2>
            <p className="text-sm text-slate-500">
              There is not enough history to score this business fairly. This is not a decline.
            </p>
          </div>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-6 text-sm text-slate-700">
          {score.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-lg font-bold">Credit assessment: {sourceName}</h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-emerald-600 hover:text-emerald-700"
        >
          <Printer size={16} /> Export report
        </button>
      </div>

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2">
          <Gauge score={score.score} verdict={score.verdict} />
          <span
            className={`rounded-full px-4 py-1 text-sm font-bold ${VERDICT_STYLE[score.verdict].chip}`}
          >
            {VERDICT_STYLE[score.verdict].label}
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <Wallet size={14} /> Recommended limit
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">
                {fmt(score.recommendedLimit)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Safe repayment: {fmt(score.safeMonthlyPayment)}/month
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {score.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <SubScores subs={score.subs} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold">Monthly performance</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
                  <th className="py-2 pr-3">Month</th>
                  <th className="py-2 pr-3">Revenue</th>
                  <th className="py-2 pr-3">Expenses</th>
                  <th className="py-2 pr-3">Net</th>
                  <th className="py-2">Selling days</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.month} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium">{m.month}</td>
                    <td className="py-2 pr-3 tabular-nums">{fmt(m.revenue)}</td>
                    <td className="py-2 pr-3 tabular-nums">{fmt(m.expenses)}</td>
                    <td
                      className={`py-2 pr-3 font-semibold tabular-nums ${m.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {m.net >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {fmt(m.net)}
                      </span>
                    </td>
                    <td className="py-2 tabular-nums">{m.sellingDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex h-28 items-end gap-2">
            {months.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-emerald-600/80"
                  style={{ height: `${Math.max(4, (m.revenue / maxRevenue) * 96)}px` }}
                  title={`${m.month}: ${fmt(m.revenue)}`}
                />
                <span className="text-[10px] text-slate-500">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">Monthly revenue</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 font-bold">
            <Users size={18} className="text-emerald-700" /> Top customers
          </h3>
          <ul className="mt-4 space-y-3">
            {customers.map((c, i) => (
              <li key={c.counterparty} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.counterparty}</p>
                  <p className="text-xs text-slate-500">{c.count} payments</p>
                </div>
                <span className="font-semibold tabular-nums">{fmt(c.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="print:hidden">
        <LoanForm score={score} />
      </div>
    </div>
  );
}
