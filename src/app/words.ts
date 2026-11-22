/* Target-word practice sets for speech-sound therapy. Picks words for the chosen target sounds and
   word positions (initial/medial/final), spreads them evenly, avoids words used recently for the
   same child, and highlights the target sound. Word bank and logic preserved from the original. */
import raw from "./data.json";

export type Lang = "en" | "kn" | "te" | "hi";
export interface Target { id: string; ipa: string; glyph: Record<Lang, string> }
interface Data {
  I18N: Record<Lang, Record<string, string>>;
  TARGETS: Target[]; LANG_NAME: Record<Lang, string>;
  BANK: Record<Lang, Record<string, Record<string, string>>>;
  POS: { id: string; k: string }[];
}
const data = raw as unknown as Data;
export const { TARGETS, LANG_NAME, POS } = data;
export const strings = data.I18N;
export const POSITIONS = [{ id: "i", k: "pI" }, { id: "m", k: "pM" }, { id: "f", k: "pF" }];

export interface WordItem { key: string; lang: Lang; word: string; pic: string; gloss: string; target: string; pos: string; custom: boolean }

/** Flatten the "word:emoji:gloss" bank into word objects. */
export function parseBank(bank = data.BANK): WordItem[] {
  const out: WordItem[] = [];
  for (const L of Object.keys(bank) as Lang[]) for (const tg in bank[L]) for (const pos in bank[L][tg])
    bank[L][tg][pos].split(",").forEach(item => {
      const [word, pic = "", gloss = ""] = item.split(":");
      out.push({ key: `${L}|${tg}|${pos}|${word}`, lang: L, word, pic, gloss, target: tg, pos, custom: false });
    });
  return out;
}

export interface HistEntry { code: string; lang: string; date: string; words: string[] }
export function recentWords(history: HistEntry[], code: string, lang: string, weeks: number): Set<string> {
  if (!code || !weeks) return new Set();
  const cutoff = Date.now() - weeks * 7 * 864e5;
  return new Set(history.filter(h => h.code === code && h.lang === lang && new Date(h.date).getTime() >= cutoff).flatMap(h => h.words));
}

export interface PoolOpts { lang: Lang; targets: string[]; positions: string[]; recent?: Set<string> }
export function pool(all: WordItem[], o: PoolOpts): WordItem[] {
  const recent = o.recent ?? new Set<string>();
  const seen = new Set<string>();
  return all.filter(w => w.lang === o.lang && o.targets.includes(w.target) && o.positions.includes(w.pos) && !recent.has(w.word))
    .filter(w => { const k = `${w.word}|${w.target}|${w.pos}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

const shuffle = <T,>(a: T[]): T[] => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/** Spread the set evenly across the chosen target+position combinations. */
export function makeSet(p: WordItem[], n: number): { set: WordItem[]; available: number } {
  const groups: Record<string, WordItem[]> = {};
  p.forEach(w => (groups[w.target + w.pos] ||= []).push(w));
  const queues = Object.values(groups).map(shuffle);
  const out: WordItem[] = [], used = new Set<string>();
  while (out.length < n && queues.some(q => q.length)) {
    for (const q of queues) {
      while (q.length && used.has(q[0].word)) q.shift();
      if (q.length && out.length < n) { const w = q.shift()!; out.push(w); used.add(w.word); }
    }
  }
  return { set: out, available: p.length };
}

export function swapWord(current: WordItem[], i: number, p: WordItem[]): WordItem | null {
  const inSet = new Set(current.map(w => w.word));
  const opts = shuffle(p.filter(w => !inSet.has(w.word)));
  return opts.find(w => w.target === current[i].target && w.pos === current[i].pos) || opts[0] || null;
}

const EN_RE: Record<string, RegExp> = { k: /(ck|k|c(?![eiy])|q)/i, g: /g(?![eiy])|g/i, s: /(s|c(?=[eiy]))/i, sh: /sh/i, r: /r/i, l: /l/i };
const COMBINING = /[ऀ-ःऺ-ॏಀ-ಃ಼-ೖఀ-ఄ఼-ౖ]/;

/** Split a word into [before, target, after] around the target sound, for highlighting. */
export function highlightParts(w: WordItem): [string, string, string] {
  const glyph = TARGETS.find(t => t.id === w.target)?.glyph[w.lang] ?? "";
  const re = w.lang === "en" ? EN_RE[w.target] : glyph ? new RegExp(glyph) : null;
  if (!re) return [w.word, "", ""];
  const word = w.word;
  let idx = -1, len = 0;
  if (w.pos === "f") { const all = [...word.matchAll(new RegExp(re.source, "gi"))]; if (all.length) { const m = all[all.length - 1]; idx = m.index!; len = m[0].length; } }
  else if (w.pos === "m") { const all = [...word.matchAll(new RegExp(re.source, "gi"))].filter(m => m.index! > 0); if (all.length) { idx = all[0].index!; len = all[0][0].length; } }
  else { const m = word.match(re); if (m && m.index === 0) { idx = 0; len = m[0].length; } }
  if (idx < 0) return [word, "", ""];
  let end = idx + len; while (end < word.length && COMBINING.test(word[end])) end++;
  return [word.slice(0, idx), word.slice(idx, end), word.slice(end)];
}
