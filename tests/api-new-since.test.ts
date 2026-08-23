/**
 * /api/new-since route tests — visit-cursor banner semantics.
 * The route reads db.visitCursor, aggregates sources created after it,
 * prioritises followed persons, then ADVANCES the cursor (shown once per
 * visit). Guests get a 200 empty payload instead of 401 (intentional).
 */
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { createDb, mkUser, nid, daysAgo, type AnyRow } from "./helpers/fakedb";

const state: { user: AnyRow | null } = { user: null };
const db = createDb();

mock.module("@/lib/auth/session", () => ({
  getSessionUser: async () => state.user,
}));
mock.module("@/lib/db", () => ({ db }));

const { GET } = await import("@/app/api/new-since/route");

function seedPerson(slug: string) {
  const p = { id: nid("per"), slug, name: slug.toUpperCase() };
  db.person.rows.push(p);
  return p;
}

function seedSource(over: AnyRow) {
  const row = {
    id: over.id ?? nid("src"),
    slug: over.slug ?? nid("slug"),
    title: over.title ?? "A title",
    year: over.year ?? 2005,
    sourceType: "shareholder_letter",
    personId: over.personId,
    createdAt: over.createdAt ?? daysAgo(1),
    _count: { passages: over.passages ?? 3 },
    person: over.person,
  };
  db.source.rows.push(row);
  return row;
}

beforeEach(() => {
  for (const t of [db.source, db.person, db.follow, db.visitCursor]) t.rows.length = 0;
  state.user = mkUser({ id: "user-1" });
});

describe("GET /api/new-since", () => {
  test("guest gets 200 with empty banner payload (not 401)", async () => {
    state.user = null;
    seedSource({ personId: "x", person: { slug: "s", name: "S" }, createdAt: daysAgo(0.001) });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ isNew: false, items: [], followedNew: 0 });
    expect(db.visitCursor.rows.length).toBe(0); // no cursor written for guests
  });

  test("first visit (no cursor): looks back 7 days, returns new sources and creates the cursor", async () => {
    const p = seedPerson("buffett");
    seedSource({
      personId: p.id,
      person: { slug: p.slug, name: p.name },
      slug: "letter-2004",
      title: "2004 Letter",
      createdAt: daysAgo(3),
    });
    seedSource({ personId: p.id, person: { slug: p.slug, name: p.name }, createdAt: daysAgo(30) }); // outside window

    const body = await (await GET()).json();
    expect(body.isNew).toBe(true);
    expect(body.totalNew).toBe(1);
    expect(body.items.length).toBe(1);
    expect(body.items[0].view).toBe("source");
    expect(body.items[0].label).toBe("2004 Letter");
    expect(body.items[0].meta).toContain("3 passages");

    expect(db.visitCursor.rows.length).toBe(1); // cursor advanced after computing
  });

  test("second call within the same visit returns an empty banner (cursor was advanced)", async () => {
    const p = seedPerson("munger");
    seedSource({ personId: p.id, person: { slug: p.slug, name: p.name }, createdAt: daysAgo(1) });

    const first = await (await GET()).json();
    expect(first.isNew).toBe(true);

    const second = await (await GET()).json();
    expect(second.isNew).toBe(false);
    expect(second.items).toEqual([]);
    expect(second.totalNew).toBe(0);
  });

  test("followed persons are prioritised and flagged; followedNew counts them", async () => {
    const followed = seedPerson("buffett");
    const stranger = seedPerson("some-other-guy");
    db.follow.rows.push({
      id: nid(), userId: "user-1", entityType: "person", entityId: "buffett",
      createdAt: daysAgo(10),
    });

    // unfollowed source is NEWER but must be deprioritised below the followed one
    seedSource({
      personId: stranger.id, person: { slug: stranger.slug, name: stranger.name },
      title: "Stranger newer", createdAt: daysAgo(0.5),
    });
    seedSource({
      personId: followed.id, person: { slug: followed.slug, name: followed.name },
      title: "Followed older", createdAt: daysAgo(2),
    });

    const body = await (await GET()).json();
    expect(body.items[0].title ?? body.items[0].label).toBe("Followed older");
    expect(body.items[0].followed).toBe(true);
    expect(body.items[1].followed).toBe(false);
    expect(body.followedNew).toBe(1);
  });

  test("items capped at 12 while totalNew reflects the full count", async () => {
    const p = seedPerson("icap");
    for (let i = 0; i < 15; i++) {
      seedSource({ personId: p.id, person: { slug: p.slug, name: p.name }, createdAt: daysAgo(1, -i * 1000) });
    }
    const body = await (await GET()).json();
    expect(body.items.length).toBe(12);
    expect(body.totalNew).toBe(15);
  });
});
