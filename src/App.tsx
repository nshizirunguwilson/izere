import { useCallback, useMemo, useRef, useState } from 'react';
import { FileUp, Landmark, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { parseCsv, ParseError } from './lib/parse';
import { checkIntegrity } from './lib/integrity';
import type { IntegrityReport, Transaction } from './lib/types';

const SAMPLES = [
  { label: 'Healthy retail shop', file: 'sample_healthy.csv' },
  { label: 'Seasonal trader', file: 'sample_seasonal.csv' },
  { label: 'Tampered statement', file: 'sample_tampered.csv' },
];

export default function App() {
  const [csvText, setCsvText] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { txns, report, parseError } = useMemo<{
    txns: Transaction[] | null;
    report: IntegrityReport | null;
    parseError: string | null;
  }>(() => {
    if (!csvText) return { txns: null, report: null, parseError: null };
    try {
      const parsed = parseCsv(csvText);
      return { txns: parsed, report: checkIntegrity(parsed), parseError: null };
    } catch (err) {
      if (err instanceof ParseError) {
        return { txns: null, report: null, parseError: err.message };
      }
      throw err;
    }
  }, [csvText]);

  const loadText = useCallback((text: string, name: string) => {
    setCsvText(text);
    setSourceName(name);
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      file.text().then((text) => loadText(text, file.name));
    },
    [loadText],
  );

  const loadSample = useCallback(
    async (file: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/samples/${file}`);
        loadText(await res.text(), file);
      } finally {
        setLoading(false);
      }
    },
    [loadText],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <Landmark size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Izere</h1>
            <p className="text-xs text-slate-500">
              Mobile Money history → lender-ready credit decision
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section
          className={`rounded-2xl border-2 border-dashed bg-white p-10 text-center transition-colors ${
            dragOver ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <FileUp className="mx-auto mb-3 text-slate-400" size={32} />
          <p className="font-semibold">Drop a MoMo statement CSV here</p>
          <p className="mt-1 text-sm text-slate-500">
            date, txn_id, type, counterparty, amount, fee, balance
          </p>
          <button
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Or load a sample:</span>
          {SAMPLES.map((s) => (
            <button
              key={s.file}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-emerald-600 hover:text-emerald-700"
              onClick={() => loadSample(s.file)}
            >
              {s.label}
            </button>
          ))}
          {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
        </div>

        {parseError && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
            <ShieldAlert className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-semibold">Could not read {sourceName}</p>
              <p className="mt-1 text-sm">{parseError}</p>
            </div>
          </div>
        )}

        {report && !report.valid && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
            <ShieldAlert className="mt-0.5 shrink-0" size={20} />
            <div className="text-sm">
              <p className="text-base font-semibold">
                Statement failed the integrity check — no score will be issued
              </p>
              {report.brokenRows.length > 0 && (
                <p className="mt-2">
                  Balance chain breaks at row{report.brokenRows.length > 1 ? 's' : ''}{' '}
                  <span className="font-semibold">{report.brokenRows.join(', ')}</span>: the
                  recorded balance does not match the previous balance plus this transaction.
                </p>
              )}
              {report.duplicateIds.length > 0 && (
                <p className="mt-2">
                  Duplicate transaction IDs:{' '}
                  <span className="font-semibold">{report.duplicateIds.join(', ')}</span>
                </p>
              )}
              {report.outOfOrderRows.length > 0 && (
                <p className="mt-2">
                  Transactions out of chronological order at row
                  {report.outOfOrderRows.length > 1 ? 's' : ''}{' '}
                  <span className="font-semibold">{report.outOfOrderRows.join(', ')}</span>
                </p>
              )}
              <p className="mt-2 text-red-700">
                This statement appears edited or incomplete. Ask the business for a fresh export
                before assessing.
              </p>
            </div>
          </div>
        )}

        {txns && report?.valid && (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <ShieldCheck size={20} />
            <p className="text-sm">
              <span className="font-semibold">{sourceName}</span> verified: {txns.length}{' '}
              transactions, balance chain intact, no duplicates, dates in order.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
