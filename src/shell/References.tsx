/* Offline reference retrieval ("RAG" without a model). A small library of short, checked
   passages ships with the app. MiniSearch finds the passages that match a question or the
   current result. Every passage shows its source. If nothing matches, the panel says so
   instead of inventing an answer. */
import MiniSearch from "minisearch";
import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { z } from "zod";
import { Input } from "./ui";

export const RefSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  source: z.string(),
  year: z.union([z.number(), z.string()]),
  url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  checked: z.string()
});
export type Ref = z.infer<typeof RefSchema>;

export function buildIndex(refs: Ref[]): MiniSearch<Ref> {
  const ms = new MiniSearch<Ref>({
    fields: ["title", "text", "tags"],
    storeFields: ["id"],
    extractField: (doc, field) => field === "tags" ? doc.tags.join(" ") : (doc as unknown as Record<string, string>)[field],
    searchOptions: { boost: { title: 2, tags: 2 }, prefix: true, fuzzy: 0.15, combineWith: "OR" }
  });
  ms.addAll(refs);
  return ms;
}

export function retrieve(ms: MiniSearch<Ref>, refs: Ref[], query: string, limit = 4, minScore = 2): Ref[] {
  if (!query.trim()) return [];
  return ms.search(query).filter(r => r.score >= minScore).slice(0, limit).map(r => refs.find(x => x.id === r.id)!).filter(Boolean);
}

function RefCard({ r }: { r: Ref }) {
  return (
    <li className="rounded-lg border border-line bg-paper p-3">
      <p className="m-0 font-bold">{r.title}</p>
      <p className="m-0 mt-1 text-[0.95rem]">{r.text}</p>
      <p className="m-0 mt-2 text-[0.82rem] text-muted">
        {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.source}</a> : r.source} ({r.year}). Checked {r.checked}.
      </p>
    </li>
  );
}

/** contextQuery: retrieved automatically for the current result (e.g. the grade shown). */
export function References({ refs: raw, contextQuery, contextLabel = "Why this result?" }: { refs: unknown[]; contextQuery?: string; contextLabel?: string }) {
  const refs = useMemo(() => raw.map(r => RefSchema.parse(r)), [raw]);
  const ms = useMemo(() => buildIndex(refs), [refs]);
  const [q, setQ] = useState("");
  const ctx = useMemo(() => retrieve(ms, refs, contextQuery ?? "", 3), [ms, refs, contextQuery]);
  const hits = useMemo(() => retrieve(ms, refs, q, 5, 1), [ms, refs, q]);
  return (
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="refs-title">
      <h2 id="refs-title" className="m-0 flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5" aria-hidden /> References</h2>
      <p className="m-0 mt-1 text-[0.9rem] text-muted">A built-in library of {refs.length} checked passages. Works offline; nothing is generated.</p>
      {contextQuery !== undefined && (
        <div className="mt-3">
          <h3 className="m-0 text-base font-bold">{contextLabel}</h3>
          {ctx.length ? <ul className="m-0 mt-2 grid list-none gap-2 p-0">{ctx.map(r => <RefCard key={r.id} r={r} />)}</ul>
            : <p className="m-0 mt-1 text-[0.92rem] text-muted">{contextQuery ? "No verified reference in this library matches the current result." : "Enter data to see the relevant references."}</p>}
        </div>
      )}
      <div className="mt-4">
        <label htmlFor="ref-q" className="block text-[0.92rem] font-bold">Search the library</label>
        <div className="relative mt-1.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input id="ref-q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. unilateral, masking, flow test" className="pl-9" />
        </div>
        <div aria-live="polite">
          {q.trim() && (hits.length ? <ul className="m-0 mt-2 grid list-none gap-2 p-0">{hits.map(r => <RefCard key={r.id} r={r} />)}</ul>
            : <p className="m-0 mt-2 text-[0.92rem] text-muted">No verified reference in this library matches “{q}”. Check the original sources listed at the bottom of the page.</p>)}
        </div>
      </div>
    </section>
  );
}
