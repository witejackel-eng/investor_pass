/**
 * /api/passages/[id] route tests.
 * Next 16 signature: GET(req, { params: Promise<{ id }> }) — params must be
 * awaited by the handler, so tests pass a resolved Promise.
 *
 * The fixture keeps source.year = null and no themes/concepts so the
 * "thinking rails" queries are skipped entirely (tagFilter null +
 * sharedIdeaClauses empty) — those deep Prisma query shapes are out of scope
 * for an in-memory fake.
 */
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { createDb, mkUser, type AnyRow } from "./helpers/fakedb";

const state: { user: AnyRow | null } = { user: null };
const db = createDb();

mock.module("@/lib/auth/session", () => ({
  getSessionUser: async () => state.user,
}));
mock.module("@/lib/db", () => ({ db }));

const { GET } = await import("@/app/api/passages/[id]/route");

function makePassage(over: AnyRow): AnyRow {
  return {
    id: over.id ?? "p-main",
    text: over.text ?? "Price is what you pay...",
    context: null,
    section: over.section !== undefined ? over.section : "Value",
    sequence: over.sequence ?? 2,
    visibility: over.visibility ?? "public",
    sourceId: "src-1",
    source: {
      id: "src-1",
      slug: "brk-2004-letter",
      title: "2004 Shareholder Letter",
      sourceType: "shareholder_letter",
      year: null, // keeps rails disabled in these tests
      publicationDate: null,
      publisher: "Berkshire",
      url: null,
      description: null,
      provenanceStatus: "verified",
      retrievalAt: null,
      person: { slug: "buffett", name: "Warren Buffett" },
    },
    passageThemes: [],
    passageConcepts: [],
    passageCompanies: [],
    passageEvents: [],
  };
}

function call(id: string) {
  return GET(new Request(`http://localhost/api/passages/${id}`), {
    params: Promise.resolve({ id }),
  });
}

beforeEach(() => {
  db.passage.rows.length = 0;
  state.user = mkUser({ id: "user-1", entitlement: "free" });
});

describe("GET /api/passages/[id]", () => {
  test("unknown id → 404 (note: DB lookup happens before any auth check)", async () => {
    const res = await call("does-not-exist");
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/not found/i);
  });

  test("pro-visible passage blocked for free user with 403", async () => {
    db.passage.rows.push(makePassage({ visibility: "pro" }));
    const res = await call("p-main");
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/pro/i);
  });

  test("pro user can read a pro-visible passage; payload includes source/themes shape", async () => {
    state.user = mkUser({ id: "user-1", entitlement: "pro" });
    db.passage.rows.push(makePassage({ visibility: "pro" }));
    const res = await call("p-main");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.passage.visibility).toBe("pro");
    expect(body.source.slug).toBe("brk-2004-letter");
    expect(body.source.person).toEqual({ slug: "buffett", name: "Warren Buffett" });
    expect(body.themes).toEqual([]);
    expect(body.rails).toEqual({ earlier: [], later: [] , sameConceptElsewhere: [] });
  });

  test("navigation hides pro siblings from free users (index/total/prev/next)", async () => {
    // sibling layout: p-a (pro, seq 1) · p-main (public, seq 2) · p-c (public, seq 3)
    db.passage.rows.push(
      makePassage({ id: "p-a", sequence: 1, visibility: "pro", section: null }),
      makePassage({}),
      makePassage({ id: "p-c", sequence: 3, visibility: "public", section: "Notes" })
    );

    const body = await (await call("p-main")).json();
    expect(body.navigation.total).toBe(2); // pro sibling excluded
    expect(body.navigation.index).toBe(1);
    expect(body.navigation.prev).toBeNull();
    expect(body.navigation.next).toEqual({ id: "p-c", section: "Notes" });

    // Same data, pro user sees all three siblings
    state.user = mkUser({ id: "user-1", entitlement: "pro" });
    const proBody = await (await call("p-main")).json();
    expect(proBody.navigation.total).toBe(3);
    expect(proBody.navigation.prev).toEqual({ id: "p-a", section: null });
    expect(proBody.navigation.next).toEqual({ id: "p-c", section: "Notes" });
  });
});
