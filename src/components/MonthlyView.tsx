import { useMemo } from 'react';
import { aggregateMonths } from '../lib/engine';
import type { Transaction } from '../lib/types';
import { formatMonth, useLang } from '../i18n';

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

export default function MonthlyView({ txns }: { txns: Transaction[] }) {
  const { t } = useLang();
  const months = useMemo(() => aggregateMonths(txns), [txns]);

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5">
      <h3 className="font-bold">{t.results.monthlySummary}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
              <th className="py-2.5 pr-4">{t.results.table.month}</th>
              <th className="py-2.5 pr-4 text-right">{t.results.table.inflow}</th>
              <th className="py-2.5 pr-4 text-right">{t.results.table.expenses}</th>
              <th className="py-2.5 pr-4 text-right">{t.results.table.net}</th>
              <th className="py-2.5 text-right">{t.results.table.sellingDays}</th>
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
