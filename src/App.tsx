import { useCallback, useMemo, useRef, useState } from 'react';
import { FileUp, Landmark, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { parseCsv, ParseError } from './lib/parse';
import { checkIntegrity } from './lib/integrity';
import type { IntegrityReport, Transaction } from './lib/types';
import IntegrityTable from './components/IntegrityTable';
import Results from './components/Results';
import { useLang, type Lang } from './i18n';

const SAMPLES = [
  { key: 'healthy', file: 'sample_healthy.csv' },
  { key: 'seasonal', file: 'sample_seasonal.csv' },
  { key: 'tampered', file: 'sample_tampered.csv' },
] as const;

const LANGS: { code: Lang; label: string }[] = [
  { code: 'rw', label: 'RW' },
  { code: 'en', label: 'EN' },
];

export default function App() {
  const { lang, t, setLang } = useLang();
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
            <p className="text-xs text-slate-500">{t.tagline}</p>
          </div>
          <div className="ml-auto flex gap-0.5 rounded-lg border border-slate-200 p-0.5 print:hidden">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                  lang === code
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section
          className={`rounded-2xl border-2 border-dashed bg-white p-10 text-center transition-colors print:hidden ${
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
          <p className="font-semibold">{t.upload.drop}</p>
          <p className="mt-1 text-sm text-slate-500">{t.upload.columns}</p>
          <button
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            onClick={() => inputRef.current?.click()}
          >
            {t.upload.choose}
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

        <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
          <span className="text-sm font-medium text-slate-500">{t.upload.orSample}</span>
          {SAMPLES.map((s) => (
            <button
              key={s.file}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-emerald-600 hover:text-emerald-700"
              onClick={() => loadSample(s.file)}
            >
              {t.upload.samples[s.key]}
            </button>
          ))}
          {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
        </div>

        {parseError && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
            <ShieldAlert className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-semibold">{t.parseErrorTitle(sourceName)}</p>
              <p className="mt-1 text-sm">{parseError}</p>
            </div>
          </div>
        )}

        {report && !report.valid && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
            <ShieldAlert className="mt-0.5 shrink-0" size={20} />
            <div className="text-sm">
              <p className="text-base font-semibold">{t.integrity.failTitle}</p>
              {report.brokenRows.length > 0 && (
                <p className="mt-2">
                  {t.integrity.brokenRows(
                    report.brokenRows.join(', '),
                    report.brokenRows.length > 1,
                  )}
                </p>
              )}
              {report.duplicateIds.length > 0 && (
                <p className="mt-2">{t.integrity.duplicates(report.duplicateIds.join(', '))}</p>
              )}
              {report.outOfOrderRows.length > 0 && (
                <p className="mt-2">
                  {t.integrity.outOfOrder(
                    report.outOfOrderRows.join(', '),
                    report.outOfOrderRows.length > 1,
                  )}
                </p>
              )}
              <p className="mt-2 text-red-700">{t.integrity.advice}</p>
              {txns && report.brokenRows.length > 0 && (
                <IntegrityTable txns={txns} report={report} />
              )}
            </div>
          </div>
        )}

        {txns && report?.valid && (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <ShieldCheck size={20} />
            <p className="text-sm">{t.integrity.verified(sourceName, txns.length)}</p>
          </div>
        )}

        {txns && report?.valid && <Results txns={txns} sourceName={sourceName} />}
      </main>
    </div>
  );
}
