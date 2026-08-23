/**
 * In-memory fake Prisma client covering only the methods/queries used by the
 * API routes under test (follows, bookmarks, notifications, new-since,
 * digest, passages/[id]). Plain-object tables; returns clones so callers
 * cannot mutate internal state (mimics Prisma row snapshots).
 *
 * Supported where operators: equality, null/undefined, {in}, {not},
 * {gt}, {gte}, {lt}, {lte}. Unsupported shapes throw loudly so tests
 * fail fast instead of silently matching everything.
 */
export type AnyRow = Record<string, any>;

export function nid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function clone<T>(v: T): T {
  return v === undefined ? v : (structuredClone(v) as T);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && !(v instanceof Date);
}

function matches(row: AnyRow, where: AnyRow | undefined): boolean {
  if (!where) return true;
  return Object.entries(where).every(([k, cond]) => {
    if (cond === null || cond === undefined) return row[k] === null || row[k] === undefined;
    if (isPlainObject(cond)) {
      return Object.entries(cond).every(([op, val]) => {
        switch (op) {
          case "in":
            return (val as unknown[]).some((v) => row[k] === v);
          case "notIn":
            return !(val as unknown[]).includes(row[k]);
          case "not":
            return row[k] !== val;
          case "gt":
            return row[k] > (val as any);
          case "gte":
            return row[k] >= (val as any);
          case "lt":
            return row[k] < (val as any);
          case "lte":
            return row[k] <= (val as any);
          default:
            throw new Error(`fakedb: unsupported operator "${op}" on field "${k}"`);
        }
      });
    }
    return row[k] === cond;
  });
}

function sortBy(rows: AnyRow[], orderBy: unknown): AnyRow[] {
  if (!orderBy) return rows;
  const specs = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const spec of specs) {
      for (const [k, dir] of Object.entries(spec as AnyRow)) {
        if (isPlainObject((spec as AnyRow)[k])) {
          throw new Error(`fakedb: nested orderBy on "${k}" not supported`);
        }
        const av = a[k] as any;
        const bv = b[k] as any;
        let cmp = av < bv ? -1 : av > bv ? 1 : 0;
        if (dir === "desc") cmp = -cmp;
        if (cmp !== 0) return cmp;
      }
    }
    return 0;
  });
}

// Prisma compound-key wheres look like { userId_entityType_entityId: {...} }.
function unwrapCompound(where: AnyRow | undefined): AnyRow | undefined {
  if (!where) return where;
  const keys = Object.keys(where);
  if (keys.length === 1 && keys[0].includes("_") && isPlainObject(where[keys[0]])) {
    return where[keys[0]] as AnyRow;
  }
  return where;
}

function makeTable() {
  const rows: AnyRow[] = [];
  type Args = any;

  return {
    rows,
    findMany(args: Args = {}): AnyRow[] {
      const found = sortBy(rows.filter((r) => matches(r, args.where)), args.orderBy);
      return clone(found.slice(0, args.take ?? Infinity));
    },
    findUnique(args: Args = {}): AnyRow | null {
      const w = unwrapCompound(args.where);
      const r = rows.find((x) => matches(x, w));
      return r ? clone(r) : null;
    },
    count(args: Args = {}): number {
      return rows.filter((r) => matches(r, args.where)).length;
    },
    async upsert(args: Args): Promise<AnyRow> {
      const w = unwrapCompound(args.where);
      const i = rows.findIndex((x) => matches(x, w));
      if (i >= 0) {
        Object.assign(rows[i], clone(args.update ?? {}));
        return clone(rows[i]);
      }
      const created = { id: nid(), createdAt: new Date(), ...clone(args.create ?? {}) };
      rows.push(created);
      return clone(created);
    },
    async deleteMany(args: Args = {}): Promise<{ count: number }> {
      const keep = rows.filter((r) => !matches(r, args.where));
      const count = rows.length - keep.length;
      rows.length = 0;
      rows.push(...keep);
      return { count };
    },
    async updateMany(args: Args): Promise<{ count: number }> {
      let count = 0;
      for (const r of rows) {
        if (matches(r, args.where)) {
          Object.assign(r, clone(args.data ?? {}));
          count++;
        }
      }
      return { count };
    },
  };
}

export function createDb() {
  return {
    follow: makeTable(),
    bookmark: makeTable(),
    notification: makeTable(),
    visitCursor: makeTable(),
    subscription: makeTable(),
    session: makeTable(),
    person: makeTable(),
    source: makeTable(),
    passage: makeTable(),
    passageTheme: makeTable(),
    theme: makeTable(),
    concept: makeTable(),
    company: makeTable(),
  };
}

export type FakeDb = ReturnType<typeof createDb>;

/** Session-user shape returned by getSessionUser(). */
export function mkUser(over: Partial<AnyRow> = {}) {
  return {
    id: over.id ?? nid("user"),
    email: over.email ?? "u@test.dev",
    name: (over.name as string | null) ?? "Test User",
    entitlement: over.entitlement ?? "free",
    role: over.role ?? "user",
  };
}

export function daysAgo(n: number, jitterMs = 0): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000 + jitterMs);
}
