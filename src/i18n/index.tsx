import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { en, type Dict } from './en';
import { rw } from './rw';

export type Lang = 'en' | 'rw';
export type { Dict };

const DICTS: Record<Lang, Dict> = { en, rw };
const STORAGE_KEY = 'izere-lang';

function initialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'rw') return stored;
  return navigator.language.toLowerCase().startsWith('rw') ? 'rw' : 'en';
}

interface LangContextValue {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue>({ lang: 'en', t: en, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, t: DICTS[lang], setLang }}>
      {children}
    </LangContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  return useContext(LangContext);
}

// 'YYYY-MM' -> localized "Month YYYY"
export function formatMonth(month: string, t: Dict): string {
  const [year, m] = month.split('-');
  return `${t.months[Number(m) - 1]} ${year}`;
}
