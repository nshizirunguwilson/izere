import { useCallback, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  FileUp,
  Landmark,
  LayoutGrid,
  Loader2,
  Plus,
  Printer,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { parseCsv, ParseError } from './lib/parse';
import { checkIntegrity } from './lib/integrity';
import type { IntegrityReport, Transaction } from './lib/types';
import IntegrityTable from './components/IntegrityTable';
import DashboardView from './components/DashboardView';
import MonthlyView from './components/MonthlyView';
import LoanView from './components/LoanView';
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

type View = 'dashboard' | 'monthly' | 'loan';

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
            lang === code ? 'bg-emerald-700 text-white' : 'text-slate-500 hover:text-emerald-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function UploadZone({
  onFile,
  onSample,
  loading,
  compact = false,
}: {
  onFile: (file: File) => void;
  onSample: (file: string) => void;
  loading: boolean;
  compact?: boolean;
}) {
  const { t } = useLang();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <section
        className={`rounded-xl border-2 border-dashed bg-white text-center transition-colors ${
          compact ? 'p-6' : 'p-12'
        } ${dragOver ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) onFile(file);
        }}
      >
        <FileUp className="mx-auto mb-3 text-slate-400" size={compact ? 24 : 32} />
        <p className="font-semibold">{t.upload.drop}</p>
        <p className="mt-1 text-sm text-slate-500">{t.upload.columns}</p>
        <button
          className="mt-4 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
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
            if (file) onFile(file);
            e.target.value = '';
          }}
        />
      </section>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm font-medium text-slate-500">{t.upload.orSample}</span>
        {SAMPLES.map((s) => (
          <button
            key={s.file}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium hover:border-emerald-600 hover:text-emerald-700"
            onClick={() => onSample(s.file)}
          >
            {t.upload.samples[s.key]}
          </button>
        ))}
        {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
      </div>
    </div>
  );
}

export default function App() {
  const { t } = useLang();
  const [csvText, setCsvText] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>('dashboard');

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
    setView('dashboard');
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

  const reset = useCallback(() => {
    setCsvText(null);
    setSourceName('');
    setView('dashboard');
  }, []);

  const hasData = Boolean(txns && report?.valid);

  const NAV: { key: View; label: string; icon: typeof LayoutGrid }[] = [
    { key: 'dashboard', label: t.nav.dashboard, icon: LayoutGrid },
    { key: 'monthly', label: t.nav.monthly, icon: CalendarDays },
    { key: 'loan', label: t.nav.loan, icon: Scale },
  ];

  // Landing: nothing loaded yet, or the file could not be used.
  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#f4f6f5] text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Landmark size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Izere</h1>
              <p className="text-xs text-slate-500">{t.tagline}</p>
            </div>
            <div className="ml-auto">
              <LangToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-14">
          <UploadZone onFile={handleFile} onSample={loadSample} loading={loading} />

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
              <div className="min-w-0 text-sm">
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
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6f5] text-slate-900">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white max-md:hidden print:hidden">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <Landmark size={16} />
          </div>
          <span className="text-lg font-bold tracking-tight">Izere</span>
        </div>
        <nav className="flex-1 px-3">
          <p className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {t.nav.menu}
          </p>
          <ul className="space-y-1">
            {NAV.map(({ key, label, icon: Icon }) => (
              <li key={key}>
                <button
                  onClick={() => setView(key)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    view === key
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={reset}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <Plus size={16} />
            {t.shell.newStatement}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-3.5 print:hidden">
          <span className="hidden h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white max-md:flex">
            <Landmark size={14} />
          </span>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
            <span className="truncate text-slate-600">
              {t.integrity.verified(sourceName, txns!.length)}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:border-emerald-600 hover:text-emerald-700"
            >
              <Printer size={15} />
              <span className="max-sm:hidden">{t.shell.exportReport}</span>
            </button>
            <LangToggle />
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 border-b border-slate-200 bg-white px-3 py-2 md:hidden print:hidden">
          {NAV.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                view === key ? 'bg-emerald-700 text-white' : 'text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <main className="mx-auto max-w-5xl p-5">
          <h2 className="mb-4 text-lg font-bold">{t.results.title(sourceName)}</h2>
          {view === 'dashboard' && <DashboardView txns={txns!} />}
          {view === 'monthly' && <MonthlyView txns={txns!} />}
          {view === 'loan' && <LoanView txns={txns!} />}
        </main>
      </div>
    </div>
  );
}
