/* Small accessible building blocks. Every control is at least 44 px tall for touch. */
import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Minus, Plus } from "lucide-react";

export const cx = (...c: (string | false | null | undefined)[]): string => c.filter(Boolean).join(" ");

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "quiet"; size?: "md" | "sm" };
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = "ghost", size = "md", className, type = "button", ...p }, ref) {
  return <button ref={ref} type={type} {...p} className={cx(
    "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
    size === "md" ? "min-h-11 px-4 text-[0.95rem]" : "min-h-11 px-3 text-sm",
    variant === "primary" && "border-ink bg-ink text-paper hover:opacity-90",
    variant === "ghost" && "border-ink bg-transparent text-ink hover:bg-ink/5",
    variant === "danger" && "border-high bg-transparent text-high hover:bg-high/5",
    variant === "quiet" && "border-line bg-paper text-ink hover:bg-surface",
    className)} />;
});

export function Panel({ title, action, children, className, id }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cx("rounded-xl border border-line bg-surface p-4 sm:p-5", className)} aria-label={typeof title === "string" ? title : undefined}>
      {(title || action) && <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {title && <h2 className="m-0 text-lg font-bold leading-tight">{title}</h2>}{action}</div>}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: (id: string) => ReactNode; className?: string }) {
  const id = useId();
  return (
    <div className={cx("mt-3", className)}>
      <label htmlFor={id} className="block text-[0.92rem] font-bold">{label}</label>
      {hint && <p className="m-0 text-[0.82rem] text-muted">{hint}</p>}
      <div className="mt-1.5">{children(id)}</div>
    </div>
  );
}

const inputCls = "block w-full min-h-11 rounded-md border border-line bg-paper px-3 py-2 text-base aria-[invalid=true]:border-high aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-high";
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} {...p} className={cx(inputCls, className)} />;
});
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...p }, ref) {
  return <select ref={ref} {...p} className={cx(inputCls, className)} />;
});
export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea({ className, ...p }, ref) {
  return <textarea ref={ref} {...p} className={cx(inputCls, "min-h-24", className)} />;
});

export function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" className="mt-1 h-5 w-5 flex-none accent-[var(--color-ink)]" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

/** Segmented choice (single select), keyboard accessible as a group of toggle buttons. */
export function Segmented<T extends string | number>({ value, options, onChange, label, size = "md" }: { value: T | undefined; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; label: string; size?: "md" | "sm" }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
      {options.map(o => (
        <button key={String(o.value)} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={cx("min-h-11 rounded-full px-4 font-semibold", size === "sm" ? "text-sm" : "text-[0.95rem]",
            value === o.value ? "bg-ink text-paper" : "text-ink hover:bg-ink/5")}>{o.label}</button>
      ))}
    </div>
  );
}

export function Pill({ tone = "info", children }: { tone?: "ok" | "mid" | "high" | "info" | "muted"; children: ReactNode }) {
  const c = { ok: "text-ok", mid: "text-mid", high: "text-high", info: "text-accent", muted: "text-muted" }[tone];
  return <span className={cx("inline-block whitespace-nowrap rounded-full border-[1.5px] border-current px-2.5 py-0.5 text-[0.8rem] font-bold", c)}>{children}</span>;
}

export function Callout({ tone = "info", title, children }: { tone?: "ok" | "mid" | "high" | "info"; title?: ReactNode; children: ReactNode }) {
  const c = { ok: "border-ok bg-ok/8", mid: "border-mid bg-mid/10", high: "border-high bg-high/8", info: "border-accent bg-accent/8" }[tone];
  return (
    <div className={cx("mt-3 rounded-r-md border-l-4 px-4 py-3", c)}>
      {title && <h3 className="m-0 mb-1 text-base font-bold">{title}</h3>}
      <div className="text-[0.95rem]">{children}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-line bg-surface p-5 text-muted">{children}</div>;
}

/** Number entry with ±step buttons sized for thumbs. Accepts "NR" when allowNR is set. */
export function Stepper({ value, onChange, step = 5, min, max, label, allowNR, invalid }: {
  value: string; onChange: (v: string) => void; step?: number; min: number; max: number; label: string; allowNR?: boolean; invalid?: boolean }) {
  const bump = (d: number) => {
    const n = Number(value);
    if (value === "" || value.toUpperCase() === "NR" || !Number.isFinite(n)) { onChange(String(d > 0 ? Math.max(min, 0) : min)); return; }
    onChange(String(Math.min(max, Math.max(min, n + d))));
  };
  return (
    <div className="flex items-stretch">
      <button type="button" onClick={() => bump(-step)} aria-label={`${label}: decrease by ${step}`} className="min-h-11 w-11 flex-none rounded-l-md border border-line bg-paper hover:bg-surface"><Minus className="mx-auto h-4 w-4" aria-hidden /></button>
      <input value={value} onChange={e => onChange(e.target.value)} inputMode={allowNR ? "text" : "numeric"} aria-label={label} aria-invalid={invalid || undefined}
        className={cx("min-h-11 w-full min-w-0 border-y border-line bg-paper text-center text-base tabular-nums", invalid && "border-high ring-1 ring-high")} placeholder="–" />
      <button type="button" onClick={() => bump(step)} aria-label={`${label}: increase by ${step}`} className="min-h-11 w-11 flex-none rounded-r-md border border-line bg-paper hover:bg-surface"><Plus className="mx-auto h-4 w-4" aria-hidden /></button>
    </div>
  );
}

/** A table on wide screens that becomes stacked cards on phones. */
export function ResponsiveTable<R>({ rows, columns, rowKey, empty }: {
  rows: R[]; columns: { header: string; cell: (r: R) => ReactNode; className?: string }[]; rowKey: (r: R) => string; empty?: ReactNode }) {
  if (!rows.length) return <Empty>{empty ?? "Nothing here yet."}</Empty>;
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-[0.92rem]">
          <thead><tr>{columns.map(c => <th key={c.header} scope="col" className="whitespace-nowrap border-b border-line px-2 py-2 text-left font-bold text-muted">{c.header}</th>)}</tr></thead>
          <tbody>{rows.map(r => <tr key={rowKey(r)}>{columns.map(c => <td key={c.header} className={cx("border-b border-line px-2 py-2 align-top", c.className)}>{c.cell(r)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <ul className="m-0 grid list-none gap-3 p-0 md:hidden">
        {rows.map(r => (
          <li key={rowKey(r)} className="rounded-lg border border-line bg-paper p-3">
            <dl className="m-0 grid grid-cols-[minmax(0,40%)_1fr] gap-x-3 gap-y-1.5 text-[0.92rem]">
              {columns.map(c => <div key={c.header} className="contents"><dt className="text-muted">{c.header}</dt><dd className="m-0 min-w-0 break-words">{c.cell(r)}</dd></div>)}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
