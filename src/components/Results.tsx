import { useMemo, useState } from 'react';
import { CircleHelp, Shield, TrendingDown, Wallet } from 'lucide-react';
import { aggregateMonths, scoreTransactions } from '../lib/engine';
import { SCORE_WEIGHTS, type ScoreResult, type ScoreSubKey, type Transaction } from '../lib/types';
import { formatMonth, useLang } from '../i18n';

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

const VERDICT_STYLE: Record<ScoreResult['verdict'], { stroke: string; chip: string }> = {
  APPROVE: { stroke: '#059669', chip: 'bg-emerald-100 text-emerald-800' },
  REVIEW: { stroke: '#d97706', chip: 'bg-amber-100 text-amber-800' },
  DECLINE: { stroke: '#dc2626', chip: 'bg-red-100 text-red-800' },
  NOT_SCOREABLE: { stroke: '#64748b', chip: 'bg-slate-100 text-slate-700' },
};

function Gauge({ score, verdict }: { score: number; verdict: ScoreResult['verdict'] }) {
  const { t } = useLang();
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
        {t.results.of100}
      </text>
    </svg>
  );
}

function SubScores({ subs }: { subs: ScoreResult['subs'] }) {
  const { t } = useLang();
  const entries = (Object.keys(SCORE_WEIGHTS) as ScoreSubKey[]).map((key) => ({
    key,
    label: t.subs[key],
    weight: SCORE_WEIGHTS[key],
    value: subs[key],
  }));

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">{t.results.weightsNote}</p>
      {entries.map(({ key, label, weight, value }) => (
        <div key={key} className="flex items-center gap-3 text-sm">
          <span className="w-36 text-slate-500">
            {label}{' '}
            <span className="text-xs text-slate-400">({Math.round(weight * 100)}%)</span>
          </span>
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

export default function Results({ txns, sourceName }: { txns: Transaction[]; sourceName: string }) {
  const { t } = useLang();
  const [stressPct, setStressPct] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const score = useMemo(() => scoreTransactions(txns), [txns]);
  const stressedScore = useMemo(
    () => (stressPct > 0 ? scoreTransactions(txns, { revenueStressPct: stressPct }) : null),
    [txns, stressPct],
  );

  const display = stressedScore ?? score;

  if (score.verdict === 'NOT_SCOREABLE') {
    return (
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-3">
          <CircleHelp className="text-slate-400" size={28} />
          <div>
            <h2 className="text-lg font-bold">{t.results.notScoreable}</h2>
            <p className="text-sm text-slate-500">{t.results.notScoreableSub}</p>
          </div>
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-6 text-sm text-slate-700">
          {score.reasons.map((r) => (
            <li key={r.key}>{t.reason(r)}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-bold">{t.results.title(sourceName)}</h2>

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2">
          <Gauge score={display.score} verdict={display.verdict} />
          <span
            className={`rounded-full px-4 py-1 text-sm font-bold ${VERDICT_STYLE[display.verdict].chip}`}
          >
            {t.verdict[display.verdict]}
          </span>
          {stressedScore && stressedScore.verdict !== score.verdict && (
            <p className="text-center text-xs text-amber-700">
              {t.results.baseline(score.score, t.verdict[score.verdict])}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <Wallet size={14} /> {t.results.recommendedLimit}
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">
                {fmt(display.recommendedLimit)}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t.results.limitFormula(LIMIT_MULTIPLIER, display.meanMonthlyNet)}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                {t.results.capacity(display.monthlyRepaymentCapacity)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <Shield size={12} />
                {t.results.responsible}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {display.reasons.map((reason) => (
                <li key={reason.key} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                  {t.reason(reason)}
                </li>
              ))}
            </ul>
          </div>
          <SubScores subs={display.subs} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              <TrendingDown size={18} className="text-emerald-700" />
              {t.stress.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{t.stress.subtitle}</p>
          </div>
          <div className="flex min-w-[240px] flex-1 flex-col gap-2 sm:max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t.stress.shock}</span>
              <span className="font-bold tabular-nums text-slate-900">−{stressPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              value={stressPct}
              onChange={(e) => setStressPct(Number(e.target.value))}
              className="w-full accent-emerald-700"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0%</span>
              <span>−20%</span>
              <span>−40%</span>
            </div>
          </div>
        </div>
        {stressPct > 0 && stressedScore && (
          <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500 uppercase">{t.stress.stressedScore}</p>
              <p className="text-xl font-bold">{stressedScore.score}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">{t.stress.capacity}</p>
              <p className="font-semibold">
                {fmt(stressedScore.monthlyRepaymentCapacity)}
                {t.stress.perMonth}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">{t.stress.limit}</p>
              <p className="font-semibold">{fmt(stressedScore.recommendedLimit)}</p>
            </div>
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
      >
        {showDetails ? t.results.hideSummary : t.results.showSummary}
      </button>

      {showDetails && <MonthlySummary txns={txns} stressPct={stressPct} />}
    </div>
  );
}

const LIMIT_MULTIPLIER = 2.5;

function MonthlySummary({ txns, stressPct }: { txns: Transaction[]; stressPct: number }) {
  const { t } = useLang();
  const months = useMemo(() => {
    const base = aggregateMonths(txns);
    if (stressPct === 0) return base;
    const factor = 1 - stressPct / 100;
    return base.map((m) => ({
      ...m,
      revenue: m.revenue * factor,
      net: m.revenue * factor - m.expenses,
    }));
  }, [txns, stressPct]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="font-bold">{t.results.monthlySummary}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
              <th className="py-2 pr-3">{t.results.table.month}</th>
              <th className="py-2 pr-3">{t.results.table.inflow}</th>
              <th className="py-2 pr-3">{t.results.table.expenses}</th>
              <th className="py-2">{t.results.table.net}</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-medium">{formatMonth(m.month, t)}</td>
                <td className="py-2 pr-3 tabular-nums">{fmt(m.revenue)}</td>
                <td className="py-2 pr-3 tabular-nums">{fmt(m.expenses)}</td>
                <td
                  className={`py-2 font-semibold tabular-nums ${m.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
                >
                  {fmt(m.net)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
