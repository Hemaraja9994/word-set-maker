/* On-device storage. Values live in IndexedDB (via Dexie), which is sturdier and larger than
   localStorage. Anything saved by the earlier version of the app under the same key in
   localStorage is copied across the first time it is read. Nothing leaves the device. */
import Dexie, { type Table } from "dexie";
import { useCallback, useEffect, useRef, useState } from "react";

interface KV { key: string; value: unknown; updated: number }

class AppDB extends Dexie {
  kv!: Table<KV, string>;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ kv: "key" });
  }
}

let db: AppDB | null = null;
let memory: Record<string, unknown> = {};      // fallback if IndexedDB is blocked (private mode)
let dbOk = true;

export function initStorage(appId: string): void {
  try { db = new AppDB(`aslp-${appId}`); } catch { dbOk = false; }
}

export async function getValue<T>(key: string, fallback: T): Promise<T> {
  if (db && dbOk) {
    try {
      const row = await db.kv.get(key);
      if (row) return row.value as T;
      const legacy = readLegacy(key);
      if (legacy !== undefined) { await setValue(key, legacy); return legacy as T; }
      return fallback;
    } catch { dbOk = false; }
  }
  if (key in memory) return memory[key] as T;
  const legacy = readLegacy(key);
  return legacy !== undefined ? (legacy as T) : fallback;
}

export async function setValue<T>(key: string, value: T): Promise<void> {
  if (db && dbOk) {
    try { await db.kv.put({ key, value, updated: Date.now() }); return; } catch { dbOk = false; }
  }
  memory[key] = value;
}

export async function exportAll(): Promise<Record<string, unknown>> {
  if (db && dbOk) { const rows = await db.kv.toArray(); return Object.fromEntries(rows.map(r => [r.key, r.value])); }
  return { ...memory };
}

export async function importAll(data: Record<string, unknown>): Promise<void> {
  for (const [k, v] of Object.entries(data)) await setValue(k, v);
}

export const storageWorks = (): boolean => dbOk;

function readLegacy(key: string): unknown {
  try { const v = localStorage.getItem(key); return v == null ? undefined : JSON.parse(v); } catch { return undefined; }
}

/** React state that is saved on the device. `ready` is false until the saved value has loaded. */
export function usePersistent<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setState] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const latest = useRef(value);
  useEffect(() => {
    let alive = true;
    getValue<T>(key, initial).then(v => { if (alive) { latest.current = v; setState(v); setReady(true); } });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    const v = typeof next === "function" ? (next as (p: T) => T)(latest.current) : next;
    latest.current = v;
    setState(v);
    void setValue(key, v);
  }, [key]);
  return [value, set, ready];
}
