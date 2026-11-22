/* Word Set Maker: build target-word practice sets for speech therapy by target sound and word
   position, with the target sound highlighted and a picture. Spreads words evenly, avoids words
   used recently for the same child, prints cards and a progress chart. Four languages. On-device. */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Baby, History, Wand2 } from "lucide-react";
import { AppShell, type Section } from "@/shell/AppShell";
import { Button, Empty, Field, Input, Panel, ResponsiveTable, Select, cx } from "@/shell/ui";
import { usePersistent } from "@/shell/storage";
import { toast } from "@/shell/toast";
import { downloadCSV, esc, fmtDate, printHTML, todayISO } from "@/shell/lib";
import { LANG_NAME, POSITIONS, TARGETS, highlightParts, makeSet, parseBank, pool, recentWords, swapWord, type HistEntry, type Lang, type WordItem } from "./words";

const BASE = parseBank();
const LANGS: Lang[] = ["en", "kn", "te", "hi"];

export default function App() {
  const { t } = useTranslation();

  const [tab, setTab] = useState("make");
  const [history, setHistory] = usePersistent<HistEntry[]>("wsm-history", []);
  const [custom] = usePersistent<WordItem[]>("wsm-custom", []);
  const [prefs, setPrefs] = usePersistent<{ tlang: Lang; targets: string[]; positions: string[]; count: string; weeks: string }>("wsm-prefs", { tlang: "en", targets: ["k"], positions: ["i"], count: "8", weeks: "2" });
  const [code, setCode] = useState("");
  const [current, setCurrent] = useState<WordItem[]>([]);
  const [available, setAvailable] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const all = useMemo(() => [...BASE, ...custom], [custom]);
  const curPool = () => pool(all, { lang: prefs.tlang, targets: prefs.targets, positions: prefs.positions, recent: recentWords(history, code.trim(), prefs.tlang, Number(prefs.weeks)) });

  const sections: Section[] = [{ id: "make", label: "Make a set", icon: Wand2 }, { id: "history", label: t("histTitle"), icon: History }];
  const go = (id: string) => { setTab(id); window.scrollTo({ top: 0 }); };

  const toggle = (key: "targets" | "positions", v: string) => setPrefs(p => ({ ...p, [key]: p[key].includes(v) ? p[key].filter(x => x !== v) : [...p[key], v] }));

  const make = () => {
    if (!prefs.targets.length || !prefs.positions.length) { toast(t("errPick")); return; }
    const { set, available } = makeSet(curPool(), Number(prefs.count));
    setCurrent(set); setAvailable(available);
    if (!set.length) toast(t("none"));
  };
  const swap = (i: number) => { const w = swapWord(current, i, curPool()); if (w) setCurrent(c => c.map((x, j) => j === i ? w : x)); };
  const saveSet = () => {
    if (!code.trim()) { toast(t("needCode")); return; }
    if (!current.length) { toast(t("emptySet")); return; }
    setHistory(h => [...h, { code: code.trim(), lang: prefs.tlang, date: todayISO(), words: current.map(w => w.word) }]);
    toast(t("saved"));
  };
  const clearHist = () => { if (!confirmClear) { setConfirmClear(true); return; } setHistory(() => []); setConfirmClear(false); toast(t("cleared")); };

  const wordCard = (w: WordItem, i: number | null) => {
    const [a, mid, b] = highlightParts(w);
    return (
      <div className="flex flex-col items-center rounded-xl border border-line bg-paper p-3 text-center">
        <div className="text-4xl leading-none" aria-hidden>{w.pic || "❓"}</div>
        <div className="mt-2 text-lg font-bold" lang={w.lang}>{a}<mark className="rounded bg-accent/25 px-0.5 text-ink">{mid}</mark>{b}</div>
        {w.gloss && <div className="text-[0.78rem] text-muted">{w.gloss}</div>}
        {i !== null && <button type="button" onClick={() => swap(i)} className="mt-1 min-h-9 text-[0.78rem] font-semibold text-accent underline">{t("swap")}</button>}
      </div>
    );
  };

  const printCards = () => printHTML(`<h2>${t("printCards")} — ${esc(code || "")}</h2><p>${esc(LANG_NAME[prefs.tlang])}. ${esc(fmtDate(new Date()))}.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">${current.map(w => { const [a, m, b] = highlightParts(w); return `<div style="border:1px solid #999;border-radius:10px;padding:14px;text-align:center"><div style="font-size:34pt">${w.pic || ""}</div><div style="font-size:16pt;font-weight:700">${esc(a)}<u>${esc(m)}</u>${esc(b)}</div>${w.gloss ? `<div style="font-size:9pt;color:#555">${esc(w.gloss)}</div>` : ""}</div>`; }).join("")}</div>`);
  const histForCode = useMemo(() => history.filter(h => h.code === code.trim()), [history, code]);
  const printChart = () => printHTML(`<h2>${t("printChart")} — ${esc(code)}</h2><table><tr><th>${t("chartWord")}</th>${histForCode.map(h => `<th>${esc(fmtDate(h.date))}</th>`).join("")}</tr>${[...new Set(histForCode.flatMap(h => h.words))].map(word => `<tr><td>${esc(word)}</td>${histForCode.map(h => `<td style="text-align:center">${h.words.includes(word) ? "○" : ""}</td>`).join("")}</tr>`).join("")}</table><p style="font-size:9pt">${t("chartFoot")}</p>`);
  const csv = () => downloadCSV([[t("colDate"), t("colCode"), t("colLang"), t("colWords")], ...history.map(h => [h.date, h.code, h.lang, h.words.join(" ")])], `word-sets-${todayISO()}.csv`);

  return (
    <AppShell title={t("appName")} subtitle={t("appSub")} sections={sections} active={tab} onSection={go}
      footer={<><p className="m-0">{t("disclaimer")}</p><p className="m-0">{t("reviewNote")}</p>
        <p className="m-0">{t("builtBy")}: Hemaraja Nayaka S, Department of Audiology & Speech-Language Pathology, Yenepoya Medical College Hospital, Mangaluru.</p></>}>
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5">
        {tab === "make" && (
          <>
            <Panel title={t("setupTitle")}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("code")} hint={t("codeHint")} className="mt-0">{id => <Input id={id} value={code} maxLength={30} onChange={e => setCode(e.target.value)} />}</Field>
                <Field label={t("tlang")} className="mt-0">{id => <Select id={id} value={prefs.tlang} onChange={e => setPrefs(p => ({ ...p, tlang: e.target.value as Lang }))}>{LANGS.map(l => <option key={l} value={l}>{LANG_NAME[l]}</option>)}</Select>}</Field>
              </div>
              <fieldset className="mt-3 border-0 p-0"><legend className="text-[0.92rem] font-bold">{t("targets")}</legend>
                <div className="mt-1 flex flex-wrap gap-2">{TARGETS.map(tg => (
                  <label key={tg.id} className={cx("flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 font-semibold", prefs.targets.includes(tg.id) ? "border-ink bg-ink text-paper" : "border-line bg-paper")}>
                    <input type="checkbox" className="sr-only" checked={prefs.targets.includes(tg.id)} onChange={() => toggle("targets", tg.id)} />{tg.glyph[prefs.tlang]} <span className="text-[0.8rem] opacity-80">{tg.ipa}</span></label>))}</div>
              </fieldset>
              <fieldset className="mt-3 border-0 p-0"><legend className="text-[0.92rem] font-bold">{t("positions")}</legend>
                <div className="mt-1 flex flex-wrap gap-2">{POSITIONS.map(p => (
                  <label key={p.id} className={cx("flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 font-semibold", prefs.positions.includes(p.id) ? "border-ink bg-ink text-paper" : "border-line bg-paper")}>
                    <input type="checkbox" className="sr-only" checked={prefs.positions.includes(p.id)} onChange={() => toggle("positions", p.id)} />{t(p.k)}</label>))}</div>
              </fieldset>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label={t("count")} className="mt-0">{id => <Select id={id} value={prefs.count} onChange={e => setPrefs(p => ({ ...p, count: e.target.value }))}>{[6, 8, 10, 12, 16, 20].map(n => <option key={n} value={n}>{n}</option>)}</Select>}</Field>
                <Field label={t("weeks")} className="mt-0">{id => <Select id={id} value={prefs.weeks} onChange={e => setPrefs(p => ({ ...p, weeks: e.target.value }))}><option value="0">{t("wk0")}</option><option value="1">{t("wk1")}</option><option value="2">{t("wkN").replace("{n}", "2")}</option><option value="4">{t("wkN").replace("{n}", "4")}</option></Select>}</Field>
              </div>
              <div className="mt-4"><Button variant="primary" onClick={make}><Wand2 className="h-4 w-4" aria-hidden />{t("make")}</Button></div>
            </Panel>

            {current.length > 0 && (
              <Panel title={t("setTitle")} action={<div className="flex flex-wrap gap-2"><Button size="sm" onClick={printCards}>{t("printCards")}</Button><Button size="sm" variant="primary" onClick={saveSet}>{t("saveSet")}</Button></div>}>
                {available !== null && available < Number(prefs.count) && <p className="m-0 mb-2 text-[0.85rem] text-mid">{t("short")}</p>}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{current.map((w, i) => <div key={w.key + i}>{wordCard(w, i)}</div>)}</div>
                <p className="m-0 mt-3 text-[0.82rem] text-muted">{t("metaSet").replace("{n}", String(current.length)).replace("{lang}", LANG_NAME[prefs.tlang])}</p>
              </Panel>
            )}
          </>
        )}

        {tab === "history" && (
          <Panel title={t("histTitle")} action={history.length ? <div className="flex gap-2">{code.trim() && histForCode.length > 0 && <Button size="sm" onClick={printChart}>{t("printChart")}</Button>}<Button size="sm" onClick={csv}>{t("exportCsv")}</Button><Button size="sm" variant="danger" onClick={clearHist}>{confirmClear ? t("confirmClear") : t("clearHist")}</Button></div> : undefined}>
            {code.trim() && <p className="m-0 mb-2 text-[0.85rem] text-muted"><Baby className="mr-1 inline h-4 w-4" aria-hidden />{code.trim()}: {histForCode.length} set{histForCode.length === 1 ? "" : "s"}.</p>}
            <ResponsiveTable rows={[...history].reverse()} rowKey={h => h.date + h.code + h.words.length} empty={<Empty>{t("histEmpty")}</Empty>}
              columns={[
                { header: t("colDate"), cell: h => fmtDate(h.date) }, { header: t("colCode"), cell: h => h.code || "–" },
                { header: t("colLang"), cell: h => LANG_NAME[h.lang as Lang] ?? h.lang },
                { header: t("colWords"), cell: h => <span lang={h.lang}>{h.words.join(", ")}</span> },
                ]} />
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
