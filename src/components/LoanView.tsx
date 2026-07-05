import { useMemo, useState } from 'react';
import { assessLoan, scoreTransactions } from '../lib/engine';
import type { LoanAssessment, Transaction } from '../lib/types';
import { useLang } from '../i18n';

const LOAN_CHIP: Record<LoanAssessment['verdict'], string> = {
  MATCH: 'bg-emerald-100 text-emerald-800',
  STRETCH: 'bg-amber-100 text-amber-800',
  MISMATCH: 'bg-red-100 text-red-700',
};

export default function LoanView({ txns }: { txns: Transaction[] }) {
  const { t } = useLang();
  const [amount, setAmount] = useState('2000000');
  const [term, setTerm] = useState('6');

  const score = useMemo(() => scoreTransactions(txns), [txns]);

  const assessment = useMemo(() => {
    const a = Number(amount);
    const tm = Number(term);
    if (!(a > 0) || !Number.isInteger(tm) || tm < 1 || tm > 24) return null;
    return assessLoan({ amount: a, termMonths: tm, monthlyRate: 0.02 }, score);
  }, [amount, term, score]);

  return (
    <section className="max-w-2xl rounded-xl border border-slate-200/80 bg-white p-6">
      <h3 className="font-bold">{t.loan.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{t.loan.subtitle}</p>

      <div className="mt-5 flex flex-wrap gap-4">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-slate-600">{t.loan.amount}</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-48 rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-base focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium text-slate-600">{t.loan.term}</span>
          <input
            type="number"
            min="1"
            max="24"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-36 rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2.5 text-base focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </label>
      </div>

      {assessment && (
        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3.5 py-1 text-sm font-bold ${LOAN_CHIP[assessment.verdict]}`}
            >
              {t.loan.verdicts[assessment.verdict]}
            </span>
            <span className="text-sm text-slate-600">
              {t.loan.summary(
                assessment.requestedPayment,
                assessment.capacity,
                `${(assessment.ratio * 100).toFixed(0)}%`,
              )}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {assessment.verdict === 'MATCH' ? (
              t.loan.fits
            ) : (
              <>
                {t.loan.counterOffer(Number(term), assessment.counterOffer.maxAmountAtTerm)}
                {assessment.counterOffer.minTermForAmount !== null
                  ? t.loan.counterKeepTerm(
                      Number(amount),
                      assessment.counterOffer.minTermForAmount,
                    )
                  : t.loan.counterNoTerm(Number(amount))}
              </>
            )}
          </p>
          {assessment.reasons.map((key) => (
            <p key={key} className="mt-2 text-sm font-medium text-red-700">
              ⚠ {t.loan.reason[key]}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
