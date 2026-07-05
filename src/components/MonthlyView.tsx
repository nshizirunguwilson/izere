import { useMemo } from 'react';
import { aggregateMonths } from '../lib/engine';
import type { Transaction } from '../lib/types';
import { formatMonth, useLang } from '../i18n';
import { HelpTip, TipHeading } from './HelpTip';

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

export default function MonthlyView({ txns }: { txns: Transaction[] }) {
  const { t } = useLang();
  const months = useMemo(() => aggregateMonths(txns), [txns]);

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5">
      <TipHeading tip={t.tips.monthlySummary}>{t.results.monthlySummary}</TipHeading>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
              <th className="py-2.5 pr-4">
                <span className="inline-flex items-center gap-1">
                  {t.results.table.month}
                  <HelpTip tip={t.tips.colMonth} />
                </span>
              </th>
              <th className="py-2.5 pr-4 text-right">
                <span className="inline-flex items-center justify-end gap-1">
                  {t.results.table.inflow}
                  <HelpTip tip={t.tips.colInflow} />
                </span>
              </th>
              <th className="py-2.5 pr-4 text-right">
                <span className="inline-flex items-center justify-end gap-1">
                  {t.results.table.expenses}
                  <HelpTip tip={t.tips.colExpenses} />
                </span>
              </th>
              <th className="py-2.5 pr-4 text-right">
                <span className="inline-flex items-center justify-end gap-1">
                  {t.results.table.net}
                  <HelpTip tip={t.tips.colNet} />
                </span>
              </th>
              <th className="py-2.5 text-right">
                <span className="inline-flex items-center justify-end gap-1">
                  {t.results.table.sellingDays}
                  <HelpTip tip={t.tips.colSellingDays} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 pr-4 font-medium">{formatMonth(m.month, t)}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums">{fmt(m.revenue)}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums">{fmt(m.expenses)}</td>
                <td
                  className={`py-2.5 pr-4 text-right font-semibold tabular-nums ${
                    m.net >= 0 ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {fmt(m.net)}
                </td>
                <td className="py-2.5 text-right tabular-nums">{m.sellingDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
