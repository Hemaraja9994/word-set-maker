/* Shared helpers: dates, ids, downloads, printing. Plain functions, no React. */

export const uid = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** Today's date as YYYY-MM-DD in the user's local time zone. */
export const todayISO = (): string => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const addDays = (iso: string, n: number): string => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const daysBetween = (a: string, b: string): number =>
  Math.round((new Date(b + "T12:00:00").getTime() - new Date(a + "T12:00:00").getTime()) / 864e5);

export const localeFor = (lang: string): string => (lang === "en" ? "en-IN" : `${lang}-IN`);

export const fmtDate = (d: string | Date | null | undefined, lang = "en", opts?: Intl.DateTimeFormatOptions): string => {
  if (!d) return "–";
  const date = typeof d === "string" && d.length === 10 ? new Date(d + "T12:00:00") : new Date(d);
  return date.toLocaleDateString(localeFor(lang), opts ?? { day: "numeric", month: "short", year: "numeric" });
};

export function saveFile(content: BlobPart, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** CSV with a byte-order mark so Excel shows Kannada, Telugu and Hindi correctly. */
export function downloadCSV(rows: (string | number | null | undefined)[][], filename: string): void {
  const csv = rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  saveFile("﻿" + csv, filename, "text/csv;charset=utf-8");
}

export const downloadJSON = (obj: unknown, filename: string): void =>
  saveFile(JSON.stringify(obj, null, 2), filename, "application/json");

export const readFileText = (file: File): Promise<string> =>
  new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsText(file); });

export const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

/** Print a separate HTML block (for reports) without printing the app around it. */
export function printHTML(html: string): void {
  let area = document.getElementById("print-area");
  if (!area) { area = document.createElement("div"); area.id = "print-area"; document.body.appendChild(area); }
  area.innerHTML = html;
  document.body.classList.add("print-only-area");
  const done = () => { document.body.classList.remove("print-only-area"); window.removeEventListener("afterprint", done); };
  window.addEventListener("afterprint", done);
  window.print();
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

export async function shareText(text: string, url?: string): Promise<"shared" | "copied" | "failed"> {
  if (navigator.share) {
    try { await navigator.share({ text, url }); return "shared"; }
    catch (e) { if ((e as Error).name === "AbortError") return "shared"; }
  }
  return (await copyText(url ? `${text}\n${url}` : text)) ? "copied" : "failed";
}
