import fs from "node:fs";
import path from "node:path";

export interface CacheEntry<T> {
  value: T;
  expiresAt: number | undefined;
}

export type CacheMode = "memory" | "file";

interface Listener<T> {
  fn: (value: T) => void;
  timeout: NodeJS.Timeout | undefined;
}

export class Cache<T> {
  private readonly filePath: string | undefined = undefined;
  private readonly store = new Map<string, CacheEntry<T>>();
  private dirty = false;
  private flushTimer: NodeJS.Timeout | undefined = undefined;
  private readonly listeners = new Map<string, Set<Listener<T>>>();

  constructor(
    name: string,
    mode: CacheMode = "memory",
    directory = ".cache",
    private readonly flushDelayMs = 500,
    private readonly maxEntries = 100_000
  ) {
    if (mode === "file") {
      fs.mkdirSync(directory, { recursive: true });
      this.filePath = path.join(directory, `${name}.json`);
      this.loadFromDisk();
    }
  }

  private loadFromDisk(): void {
    if (this.filePath === undefined) return;
    try {
      const raw = fs.readFileSync(this.filePath, "utf8");
      const object = JSON.parse(raw) as Record<string, CacheEntry<T>>;
      const now = Date.now();
      for (const k in object) {
        const entry = object[k];
        if (entry === undefined) continue;
        if (entry.expiresAt !== undefined && now > entry.expiresAt) continue;
        this.store.set(k, entry);
      }
    } catch {
      void 0;
    }
  }

  private scheduleFlush(): void {
    if (this.filePath === undefined || this.flushTimer !== undefined) return;
    this.flushTimer = setTimeout((): void => {
      this.flushTimer = undefined;
      if (this.dirty) this.flush();
    }, this.flushDelayMs);
  }

  flush(): void {
    if (this.filePath === undefined) return;
    const filePath = this.filePath;
    const temporary = `${filePath}.tmp`;
    const object: Record<string, CacheEntry<T>> = {};
    for (const [k, v] of this.store) object[k] = v;
    this.dirty = false;
    fs.writeFile(temporary, JSON.stringify(object), "utf8", (): void => {
      fs.rename(temporary, filePath, (): void => {
        void 0;
      });
    });
  }

  set(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: ttlMs === undefined ? undefined : Date.now() + ttlMs
    });
    if (this.store.size > this.maxEntries) {
      const it = this.store.keys().next();
      if (it.done !== true) this.store.delete(it.value);
    }
    this.dirty = true;
    this.scheduleFlush();
    this.emit(key, value);
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  onChange(key: string, callback: (value: T) => void, expireMs?: number): () => void {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set<Listener<T>>());
    const listener: Listener<T> = {
      fn: callback,
      timeout: undefined
    };
    const set = this.listeners.get(key);
    if (set === undefined) return (): void => void 0;
    set.add(listener);
    if (expireMs !== undefined) {
      listener.timeout = setTimeout((): void => {
        set.delete(listener);
      }, expireMs);
    }
    return (): void => {
      if (listener.timeout !== undefined) clearTimeout(listener.timeout);
      set.delete(listener);
    };
  }

  private emit(key: string, value: T): void {
    const subs = this.listeners.get(key);
    if (!subs) return;
    for (const l of subs) l.fn(value);
  }

  delete(key: string): void {
    if (!this.store.delete(key)) return;
    this.dirty = true;
    this.scheduleFlush();
  }

  clear(): void {
    this.store.clear();
    this.dirty = true;
    this.scheduleFlush();
  }

  getAll(): T[] {
    const now = Date.now();
    const out: T[] = [];
    for (const [k, v] of this.store) {
      if (v.expiresAt !== undefined && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      out.push(v.value);
    }
    return out;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    const now = Date.now();
    for (const [k, v] of this.store) {
      if (v.expiresAt !== undefined && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      yield v.value;
    }
  }
}
