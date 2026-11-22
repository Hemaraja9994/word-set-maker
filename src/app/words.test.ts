import { describe, expect, it } from "vitest";
import { highlightParts, makeSet, parseBank, pool, recentWords, type WordItem } from "./words";

const base = parseBank();

describe("parseBank", () => {
  it("produces word objects with lang, target and position", () => {
    expect(base.length).toBeGreaterThan(50);
    const kite = base.find(w => w.word === "kite");
    expect(kite).toMatchObject({ lang: "en", target: "k", pos: "i" });
    expect(kite!.pic).toBe("🪁");
  });
});

describe("pool", () => {
  it("filters by language, target and position", () => {
    const p = pool(base, { lang: "en", targets: ["k"], positions: ["i"] });
    expect(p.length).toBeGreaterThan(0);
    expect(p.every(w => w.lang === "en" && w.target === "k" && w.pos === "i")).toBe(true);
  });
  it("excludes recently used words", () => {
    const kWords = pool(base, { lang: "en", targets: ["k"], positions: ["i"] }).map(w => w.word);
    const recent = new Set([kWords[0]]);
    expect(pool(base, { lang: "en", targets: ["k"], positions: ["i"], recent }).map(w => w.word)).not.toContain(kWords[0]);
  });
});

describe("recentWords", () => {
  const hist = [{ code: "C1", lang: "en", date: new Date().toISOString(), words: ["kite", "cup"] }];
  it("collects words used within the window for that child", () => {
    const s = recentWords(hist, "C1", "en", 2);
    expect(s.has("kite")).toBe(true);
  });
  it("ignores other children and old entries", () => {
    expect(recentWords(hist, "C2", "en", 2).size).toBe(0);
    const old = [{ code: "C1", lang: "en", date: new Date(Date.now() - 100 * 864e5).toISOString(), words: ["kite"] }];
    expect(recentWords(old, "C1", "en", 2).size).toBe(0);
  });
});

describe("makeSet", () => {
  it("returns up to n words spread across target+position groups", () => {
    const p = pool(base, { lang: "en", targets: ["k", "s"], positions: ["i", "f"] });
    const { set } = makeSet(p, 8);
    expect(set.length).toBe(8);
    expect(new Set(set.map(w => w.word)).size).toBe(8);   // no repeats
    expect(new Set(set.map(w => w.target + w.pos)).size).toBeGreaterThan(1);   // more than one group
  });
  it("never returns more than are available", () => {
    const p = pool(base, { lang: "en", targets: ["k"], positions: ["i"] });
    const { set, available } = makeSet(p, 999);
    expect(set.length).toBe(available);
  });
});

describe("highlightParts", () => {
  it("marks the initial target sound", () => expect(highlightParts({ lang: "en", word: "kite", target: "k", pos: "i" } as WordItem)).toEqual(["", "k", "ite"]));
  it("marks the final target sound", () => expect(highlightParts({ lang: "en", word: "book", target: "k", pos: "f" } as WordItem)).toEqual(["boo", "k", ""]));
  it("handles the 'sh' digraph", () => expect(highlightParts({ lang: "en", word: "shoe", target: "sh", pos: "i" } as WordItem)).toEqual(["", "sh", "oe"]));
});
