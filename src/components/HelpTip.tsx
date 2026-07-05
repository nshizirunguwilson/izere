import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp } from 'lucide-react';
import { useLang, type TipContent } from '../i18n';

export type Tip = TipContent;

const TIP_WIDTH = 288;
const MARGIN = 8;

// The panel is portaled to <body>: it must not inherit text-transform or
// letter-spacing from uppercase labels, be clipped by overflow containers,
// or lose stacking battles with sibling cards.
export function HelpTip({ tip }: { tip: Tip }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const place = useCallback(() => {
    const btn = btnRef.current;
    const panel = panelRef.current;
    if (!btn || !panel) return;
    const r = btn.getBoundingClientRect();
    const h = panel.offsetHeight;

    let left = r.left + r.width / 2 - TIP_WIDTH / 2;
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - TIP_WIDTH - MARGIN));

    // Below the icon by default; flip above when there is not enough room.
    let top = r.bottom + MARGIN;
    if (top + h > window.innerHeight - MARGIN && r.top - h - MARGIN >= MARGIN) {
      top = r.top - h - MARGIN;
    }
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
    else setPos(null);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={`${t.tips.helpLabel}: ${tip.title}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex rounded-full p-0.5 align-middle text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <CircleHelp size={15} strokeWidth={2.25} />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role="tooltip"
            style={{
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: TIP_WIDTH,
              visibility: pos ? 'visible' : 'hidden',
            }}
            className="fixed z-50 rounded-xl border border-slate-200 bg-white p-3.5 text-left text-sm leading-relaxed font-normal tracking-normal normal-case text-slate-700 shadow-lg"
          >
            <p className="font-semibold text-slate-900">{tip.title}</p>
            <p className="mt-1.5">{tip.body}</p>
            {tip.example && (
              <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{t.tips.exampleLabel}: </span>
                {tip.example}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

/** Label text with a help icon beside it. */
export function TipLabel({
  label,
  tip,
  className = '',
}: {
  label: string;
  tip: Tip;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span>{label}</span>
      <HelpTip tip={tip} />
    </span>
  );
}

/** Section heading with optional help icon. */
export function TipHeading({
  children,
  tip,
  className = 'font-bold',
}: {
  children: React.ReactNode;
  tip: Tip;
  className?: string;
}) {
  return (
    <h3 className={`inline-flex items-center gap-2 ${className}`}>
      {children}
      <HelpTip tip={tip} />
    </h3>
  );
}

/** Uppercase metric label with help. */
export function TipMetricLabel({ label, tip }: { label: string; tip: Tip }) {
  return (
    <p className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
      {label}
      <HelpTip tip={tip} />
    </p>
  );
}
