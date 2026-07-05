import { Fragment, useMemo } from 'react';
import { buildIntegrityAudit, integrityRowsForDisplay } from '../lib/integrity';
import type { IntegrityReport, Transaction } from '../lib/types';
import { useLang } from '../i18n';
import { HelpTip } from './HelpTip';

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

export default function IntegrityTable({
  txns,
  report,
}: {
  txns: Transaction[];
  report: IntegrityReport;
}) {
  const { t } = useLang();
  const rows = useMemo(() => {
    const audit = buildIntegrityAudit(txns);
    return integrityRowsForDisplay(audit, report.brokenRows);
  }, [txns, report.brokenRows]);

  const brokenSet = useMemo(() => new Set(report.brokenRows), [report.brokenRows]);

  return (
    <div className="mt-4">
      <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-900">
        {t.integrity.table.auditTitle}
        <HelpTip tip={t.tips.integrityTable} />
      </p>
      <div className="overflow-x-auto rounded-xl border border-red-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-red-100 bg-red-50/80 text-left text-xs tracking-wide text-red-900 uppercase">
            <th className="px-3 py-2">{t.integrity.table.row}</th>
            <th className="px-3 py-2">{t.integrity.table.date}</th>
            <th className="px-3 py-2">{t.integrity.table.description}</th>
            <th className="px-3 py-2">{t.integrity.table.type}</th>
            <th className="px-3 py-2 text-right">{t.integrity.table.amount}</th>
            <th className="px-3 py-2 text-right">
              <span className="inline-flex items-center justify-end gap-1">
                {t.integrity.table.expected}
                <HelpTip tip={t.tips.integrityExpected} />
              </span>
            </th>
            <th className="px-3 py-2 text-right">
              <span className="inline-flex items-center justify-end gap-1">
                {t.integrity.table.recorded}
                <HelpTip tip={t.tips.integrityRecorded} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isBroken = brokenSet.has(row.rowNumber);
            const showGap = idx > 0 && rows[idx - 1].rowNumber + 1 < row.rowNumber;

            return (
              <Fragment key={row.rowNumber}>
                {showGap && (
                  <tr>
                    <td colSpan={7} className="px-3 py-1 text-center text-xs text-slate-400">
                      {t.integrity.table.hidden(row.rowNumber - rows[idx - 1].rowNumber - 1)}
                    </td>
                  </tr>
                )}
                <tr
                  className={
                    isBroken
                      ? 'border-b border-red-200 bg-red-100 text-red-950'
                      : 'border-b border-slate-100 text-slate-800'
                  }
                >
                  <td className="px-3 py-2 font-bold tabular-nums">{row.rowNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.date}</td>
                  <td className="max-w-[180px] truncate px-3 py-2" title={row.description}>
                    {row.description}
                  </td>
                  <td className="px-3 py-2 text-xs">{row.type.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt(row.amount)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.expectedBalance === null ? '-' : fmt(row.expectedBalance)}
                  </td>
                  <td className={`px-3 py-2 text-right font-semibold tabular-nums ${isBroken ? 'text-red-700' : ''}`}>
                    {fmt(row.balance)}
                    {isBroken && (
                      <span className="mt-0.5 block text-xs font-normal">
                        {t.integrity.table.mismatch((row.expectedBalance ?? 0) - row.balance)}
                      </span>
                    )}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
