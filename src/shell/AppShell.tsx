/* The frame every app shares: header, language menu, online status, optional section tabs
   (a bottom bar on phones), footer with sources and credit, toast messages, and an error
   screen if something breaks. */
import { useEffect, useState, type ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { useToast } from "./toast";
import { cx } from "./ui";
import { storageWorks } from "./storage";
import app from "../../app.config.json";

export const LANG_NAMES: Record<string, string> = { en: "English", kn: "ಕನ್ನಡ", te: "తెలుగు", hi: "हिन्दी" };
const AUTHOR = "Hemaraja Nayaka S, Department of Audiology & Speech-Language Pathology, Yenepoya Medical College Hospital, Mangaluru";

function useOnline(): boolean {
  const [on, setOn] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const a = () => setOn(true), b = () => setOn(false);
    window.addEventListener("online", a); window.addEventListener("offline", b);
    return () => { window.removeEventListener("online", a); window.removeEventListener("offline", b); };
  }, []);
  return on;
}

function Crash({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" className="mx-auto mt-10 max-w-xl rounded-xl border border-high bg-surface p-5">
      <h2 className="m-0 text-lg font-bold">Something went wrong on this screen</h2>
      <p className="mt-2">Your saved data is safe on this device. Try again, or reload the page.</p>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-muted">{String((error as Error)?.message ?? error)}</pre>
      <button type="button" onClick={resetErrorBoundary} className="mt-3 min-h-11 rounded-md border border-ink px-4 font-semibold">Try again</button>
    </div>
  );
}

export interface Section { id: string; label: string; icon: LucideIcon }

export function AppShell({ title, subtitle, sections, active, onSection, footer, children }: {
  title: string; subtitle: string; sections?: Section[]; active?: string; onSection?: (id: string) => void; footer?: ReactNode; children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const online = useOnline();
  const msg = useToast(s => s.message);
  const langs = Object.keys(i18n.options.resources ?? { en: {} });
  useEffect(() => { document.documentElement.lang = i18n.language; }, [i18n.language]);
  const hasTabs = !!sections?.length;
  return (
    <div className={cx("min-h-dvh", hasTabs && "pb-20 lg:pb-0")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:p-2">Skip to content</a>
      <header className="bg-ink text-paper no-print">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/icon.svg" width={36} height={36} alt="" className="flex-none rounded-lg" />
            <div className="min-w-0">
              <h1 className="m-0 truncate text-lg font-bold leading-tight">{title}</h1>
              <p className="m-0 truncate text-[0.8rem] text-paper/75">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span role="status" className={cx("rounded-full border px-2.5 py-1 text-xs", online ? "border-paper/35" : "border-transparent bg-mid text-white")}>{online ? t("shell.online") : t("shell.offline")}</span>
            {langs.length > 1 && (
              <label className="flex items-center"><span className="sr-only">{t("shell.language")}</span>
                <select value={i18n.language} onChange={e => { void i18n.changeLanguage(e.target.value); try { localStorage.setItem("aslp-kit-lang", JSON.stringify(e.target.value)); } catch { /* ignore */ } }}
                  className="min-h-11 rounded-md bg-paper px-2 text-sm text-ink">{langs.map(l => <option key={l} value={l}>{LANG_NAMES[l] ?? l}</option>)}</select>
              </label>
            )}
          </div>
        </div>
        {hasTabs && (
          <nav aria-label="Sections" className="mx-auto hidden max-w-6xl gap-1 px-4 pb-2 lg:flex">
            {sections!.map(s => (
              <button key={s.id} type="button" onClick={() => onSection?.(s.id)} aria-current={active === s.id ? "page" : undefined}
                className={cx("flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold", active === s.id ? "bg-paper text-ink" : "text-paper/85 hover:bg-paper/10")}>
                <s.icon className="h-4 w-4" aria-hidden />{s.label}</button>
            ))}
          </nav>
        )}
      </header>

      {!storageWorks() && <p className="m-0 bg-mid px-4 py-2 text-center text-sm text-white">{t("shell.noStorage")}</p>}

      <main id="main" className="mx-auto max-w-6xl px-4 pb-10 pt-5">
        <ErrorBoundary FallbackComponent={Crash}>{children}</ErrorBoundary>
      </main>

      <footer className="border-t border-line bg-surface py-5 text-[0.85rem] text-muted">
        <div className="mx-auto max-w-6xl space-y-1.5 px-4">
          {footer}
          <p className="m-0">{t("shell.onDevice")}</p>
          <p className="m-0">{t("shell.builtBy")}: {AUTHOR}. v{app.version}</p>
        </div>
      </footer>

      {hasTabs && (
        <nav aria-label="Sections" className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
          <ul className="m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${sections!.length}, minmax(0, 1fr))` }}>
            {sections!.map(s => (
              <li key={s.id}>
                <button type="button" onClick={() => onSection?.(s.id)} aria-current={active === s.id ? "page" : undefined}
                  className={cx("flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[0.72rem] font-semibold", active === s.id ? "text-accent" : "text-muted")}>
                  <s.icon className="h-5 w-5" aria-hidden /><span className="max-w-full truncate px-1">{s.label}</span></button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div role="status" aria-live="polite" className={cx("pointer-events-none fixed left-1/2 z-40 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-md bg-ink px-4 py-2.5 text-paper shadow-lg transition-opacity",
        hasTabs ? "bottom-20 lg:bottom-5" : "bottom-5", msg ? "opacity-100" : "opacity-0")}>{msg}</div>
    </div>
  );
}
