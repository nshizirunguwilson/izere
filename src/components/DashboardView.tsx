import { useMemo, useState } from 'react';
import { CircleHelp, Shield, TrendingDown, Users } from 'lucide-react';
import {
  aggregateMonths,
  LIMIT_MULTIPLIER,
  scoreTransactions,
  topCustomers,
} from '../lib/engine';
import { SCORE_WEIGHTS, type ScoreResult, type ScoreSubKey, type Transaction } from '../lib/types';
import { formatMonth, useLang } from '../i18n';
import { HelpTip, TipHeading, TipMetricLabel } from './HelpTip';

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

const SUB_TIP_KEYS: Record<ScoreSubKey, 'subInflow' | 'subRegularity' | 'subBalanceFloor' | 'subVolatility' | 'subExpenseRatio'> = {
  inflow: 'subInflow',
  regularity: 'subRegularity',
  balanceFloor: 'subBalanceFloor',
  volatility: 'subVolatility',
  expenseRatio: 'subExpenseRatio',
};

export const VERDICT_STYLE: Record<ScoreResult['verdict'], { chip: string; bar: string }> = {
  APPROVE: { chip: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-600' },
  REVIEW: { chip: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  DECLINE: { chip: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
  NOT_SCOREABLE: { chip: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' },
};

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-xl border border-slate-200/80 bg-white p-5 print:break-inside-avoid ${className}`}
    >
      {children}
    </section>
  );
}

function SubScores({ subs }: { subs: ScoreResult['subs'] }) {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      <TipHeading tip={t.tips.scoreBreakdown}>{t.dashboard.scoreBreakdown}</TipHeading>
      {(Object.keys(SCORE_WEIGHTS) as ScoreSubKey[]).map((key) => (
        <div key={key} className="text-sm">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="inline-flex items-center gap-1 text-slate-600">
              {t.subs[key]}{' '}
              <span className="text-xs text-slate-400">
                ({Math.round(SCORE_WEIGHTS[key] * 100)}%)
              </span>
              <HelpTip tip={t.tips[SUB_TIP_KEYS[key]]} />
            </span>
            <span className="font-semibold tabular-nums">{Math.round(subs[key])}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.round(subs[key])}%` }}
            />
          </div>
        </div>
      ))}
      <p className="pt-1 text-xs leading-relaxed text-slate-400">{t.results.weightsNote}</p>
    </div>
  );
}

export default function DashboardView({ txns }: { txns: Transaction[] }) {
  const { t } = useLang();
  const [stressPct, setStressPct] = useState(0);

  const score = useMemo(() => scoreTransactions(txns), [txns]);
  const stressedScore = useMemo(
    () => (stressPct > 0 ? scoreTransactions(txns, { revenueStressPct: stressPct }) : null),
    [txns, stressPct],
  );
  const months = useMemo(() => aggregateMonths(txns), [txns]);
  const customers = useMemo(() => topCustomers(txns), [txns]);

  const display = stressedScore ?? score;
  const maxInflow = Math.max(...months.map((m) => m.revenue));

  if (score.verdict === 'NOT_SCOREABLE') {
    return (
      <Card className="p-8">
        <div className="flex items-center gap-3">
          <CircleHelp className="text-slate-400" size={28} />
          <div>
            <h2 className="inline-flex items-center gap-2 text-lg font-bold">
              {t.results.notScoreable}
              <HelpTip tip={t.tips.notScoreable} />
            </h2>
            <p className="text-sm text-slate-500">{t.results.notScoreableSub}</p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-700">
          {score.reasons.map((r) => (
            <li key={r.key} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              {t.reason(r)}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white print:break-inside-avoid">
        <div className={`h-1.5 ${VERDICT_STYLE[display.verdict].bar}`} />
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4 p-6">
          <div>
            <TipMetricLabel label={t.dashboard.scoreLabel} tip={t.tips.creditScore} />
            <div className="mt-1 flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-tight tabular-nums">
                {display.score}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${VERDICT_STYLE[display.verdict].chip}`}
              >
                {t.verdict[display.verdict]}
                <HelpTip tip={t.tips.verdict} />
              </span>
            </div>
            {stressedScore && stressedScore.verdict !== score.verdict && (
              <p className="mt-1 text-xs text-amber-700">
                {t.results.baseline(score.score, t.verdict[score.verdict])}
              </p>
            )}
          </div>
          <div className="h-12 w-px bg-slate-100 max-sm:hidden" />
          <div>
            <TipMetricLabel label={t.results.recommendedLimit} tip={t.tips.recommendedLimit} />
            <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
              {fmt(display.recommendedLimit)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t.results.limitFormula(LIMIT_MULTIPLIER, display.meanMonthlyNet)}
            </p>
          </div>
          <div className="h-12 w-px bg-slate-100 max-sm:hidden" />
          <div>
            <TipMetricLabel label={t.stress.capacity} tip={t.tips.repaymentCapacity} />
            <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
              {fmt(display.monthlyRepaymentCapacity)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
              <Shield size={12} /> {t.results.responsible}
              <HelpTip tip={t.tips.responsibleLending} />
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <TipHeading tip={t.tips.whyDecision}>{t.dashboard.whyTitle}</TipHeading>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
            {display.reasons.map((reason) => (
              <li key={reason.key} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                {t.reason(reason)}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SubScores subs={display.subs} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] print:break-before-page">
        <Card>
          <TipHeading tip={t.tips.cashflowChart}>{t.dashboard.cashflow}</TipHeading>
          <div className="mt-6 flex h-36 items-end gap-3">
            {months.map((m) => {
              const inflow = stressPct > 0 ? m.revenue * (1 - stressPct / 100) : m.revenue;
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 tabular-nums max-md:hidden">
                    {fmt(inflow)}
                  </span>
                  <div
                    className="w-full max-w-14 rounded-md bg-emerald-600/85"
                    style={{ height: `${Math.max(6, (inflow / maxInflow) * 100)}px` }}
                  />
                  <span className="text-xs text-slate-500">
                    {formatMonth(m.month, t).split(' ')[0].slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 font-bold">
            <Users size={16} className="text-emerald-700" /> {t.customers.title}
            <HelpTip tip={t.tips.topCustomers} />
          </h3>
          <ul className="mt-4 space-y-3">
            {customers.map((c, i) => (
              <li key={c.counterparty} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.counterparty}</p>
                  <p className="text-xs text-slate-500">{t.customers.payments(c.count)}</p>
                </div>
                <span className="font-semibold tabular-nums">{fmt(c.total)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              <TrendingDown size={16} className="text-emerald-700" /> {t.stress.title}
              <HelpTip tip={t.tips.stressTest} />
            </h3>
            <p className="mt-1 text-sm text-slate-500">{t.stress.subtitle}</p>
          </div>
          <div className="flex min-w-[240px] flex-1 flex-col gap-2 sm:max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t.stress.shock}</span>
              <span className="font-bold tabular-nums">-{stressPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={stressPct}
              onChange={(e) => setStressPct(Number(e.target.value))}
              className="w-full accent-emerald-700"
              aria-label={t.stress.shock}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
