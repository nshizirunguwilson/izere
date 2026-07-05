import { useCallback, useRef, useState } from 'react';
import { FileUp, Landmark, Loader2 } from 'lucide-react';

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

        {csvText && (
          <p className="mt-8 text-sm text-slate-600">
            Loaded <span className="font-semibold">{sourceName}</span> (
            {csvText.trim().split('\n').length - 1} transactions)
          </p>
        )}
      </main>
    </div>
  );
}
