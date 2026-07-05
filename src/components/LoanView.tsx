import { useMemo, useState } from 'react';
import { assessLoan, scoreTransactions } from '../lib/engine';

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString('en-US')}`;

const MONTHLY_RATE = 0.02;
import type { LoanAssessment, Transaction } from '../lib/types';
import { useLang } from '../i18n';
import { HelpTip, TipHeading } from './HelpTip';

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

  const amountNum = Number(amount);
  const termNum = Number(term);
  const amountValid = amountNum > 0;
  const termValid = Number.isInteger(termNum) && termNum >= 1 && termNum <= 24;

  const assessment = useMemo(() => {
    if (!amountValid || !termValid) return null;
    return assessLoan({ amount: amountNum, termMonths: termNum, monthlyRate: MONTHLY_RATE }, score);
  }, [amountValid, termValid, amountNum, termNum, score]);

  const totalInterest = amountNum * MONTHLY_RATE * termNum;
  const totalToRepay = amountNum + totalInterest;

  return (
    <section className="max-w-2xl rounded-xl border border-slate-200/80 bg-white p-6">
      <TipHeading tip={t.tips.loanRequest}>{t.loan.title}</TipHeading>
      <p className="mt-1 text-sm text-slate-500">{t.loan.subtitle}</p>

      <div className="mt-5 flex flex-wrap gap-4">
        <label className="text-sm">
          <span className="mb-1.5 inline-flex items-center gap-1 font-medium text-slate-600">
            {t.loan.amount}
            <HelpTip tip={t.tips.loanAmount} />
          </span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!amountValid}
            className={`w-48 rounded-lg border px-3 py-2.5 text-base focus:bg-white focus:outline-none ${
              amountValid
                ? 'border-slate-300 bg-slate-50/50 focus:border-emerald-600'
                : 'border-red-400 bg-red-50/50 focus:border-red-500'
            }`}
          />
          {!amountValid && <p className="mt-1.5 w-48 text-xs text-red-600">{t.loan.invalidAmount}</p>}
        </label>
        <label className="text-sm">
          <span className="mb-1.5 inline-flex items-center gap-1 font-medium text-slate-600">
            {t.loan.term}
            <HelpTip tip={t.tips.loanTerm} />
          </span>
          <input
            type="number"
            min="1"
            max="24"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-invalid={!termValid}
            className={`w-36 rounded-lg border px-3 py-2.5 text-base focus:bg-white focus:outline-none ${
              termValid
                ? 'border-slate-300 bg-slate-50/50 focus:border-emerald-600'
                : 'border-red-400 bg-red-50/50 focus:border-red-500'
            }`}
          />
          {!termValid && <p className="mt-1.5 w-40 text-xs text-red-600">{t.loan.invalidTerm}</p>}
          {termValid && termNum >= 12 && (
            <p className="mt-1.5 text-xs text-slate-500">{t.loan.termInYears(termNum)}</p>
          )}
        </label>
      </div>

      {assessment && (
        <div className="mt-6 rounded-lg border border-slate-200/80 p-4">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t.loan.payTitle}
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">{t.loan.payMonthly}</p>
              <p className="mt-0.5 text-xl font-extrabold tracking-tight tabular-nums">
                {fmt(assessment.requestedPayment)}
              </p>
              <p className="text-xs text-slate-400">{t.loan.payMonths(termNum)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">
                {t.loan.payInterest} (2% × {termNum})
              </p>
              <p className="mt-0.5 text-xl font-extrabold tracking-tight tabular-nums">
                {fmt(totalInterest)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t.loan.payTotal}</p>
              <p className="mt-0.5 text-xl font-extrabold tracking-tight tabular-nums">
                {fmt(totalToRepay)}
              </p>
            </div>
          </div>
        </div>
      )}

      {assessment && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-sm font-bold ${LOAN_CHIP[assessment.verdict]}`}
            >
              {t.loan.verdicts[assessment.verdict]}
              <HelpTip tip={t.tips.loanVerdict} />
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
