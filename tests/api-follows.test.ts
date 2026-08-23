/**
 * /api/follows route tests.
 *
 * Mocks:
 *  - "@/lib/db"          → in-memory fake (tests/helpers/fakedb)
 *  - "@/lib/auth/session"→ getSessionUser controllable per-test via `state.user`
 *
 * NOTE: mock.module() must run before the dynamic import of the route so the
 * route module binds our fakes.
 */
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { createDb, mkUser, type AnyRow } from "./helpers/fakedb";

const state: { user: AnyRow | null } = { user: null };
const db = createDb();

mock.module("@/lib/auth/session", () => ({
  getSessionUser: async () => state.user,
}));
mock.module("@/lib/db", () => ({ db }));

const { GET, POST, DELETE } = await import("@/app/api/follows/route");

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/follows", { method: "POST", body: JSON.stringify(body) }));

const del = (query: string) =>
  DELETE(new Request(`http://localhost/api/follows?${query}`, { method: "DELETE" }));

beforeEach(() => {
  db.follow.rows.length = 0;
  state.user = mkUser({ id: "user-1" });
});

describe("POST /api/follows", () => {
  test("guest gets 401", async () => {
    state.user = null;
    const res = await post({ entityType: "person", entityId: "buffett" });
    expect(res.status).toBe(401);
    expect((await res.json()).error).toMatch(/authentication/i);
    expect(db.follow.rows.length).toBe(0);
  });

  test("creates a follow for a free user (free tier allowed)", async () => {
    const res = await post({ entityType: "person", entityId: "buffett", label: "  Warren  " });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, following: true, follow: body.follow });
    expect(body.follow.entityType).toBe("person");
    expect(body.follow.label).toBe("Warren"); // trimmed
    expect(db.follow.rows.length).toBe(1);
    expect(db.follow.rows[0].userId).toBe("user-1");
  });

  test("second identical POST is idempotent — no duplicate row; update branch applies label/frequency and bad frequency is ignored", async () => {
    await post({ entityType: "topic", entityId: "value-investing" });
    await post({ entityType: "topic", entityId: "value-investing", label: "Updated", alertFrequency: "weekly" });
    // invalid frequency must NOT clobber the stored one
    const res3 = await post({ entityType: "topic", entityId: "value-investing", alertFrequency: "hourly" });
    expect(res3.status).toBe(200);
    expect(db.follow.rows.length).toBe(1);
    expect(db.follow.rows[0].label).toBe("Updated");
    expect(db.follow.rows[0].alertFrequency).toBe("weekly");
  });

  test("invalid entityType rejected with 400", async () => {
    const res = await post({ entityType: "stonk", entityId: "gme" });
    expect(res.status).toBe(400);
    expect(db.follow.rows.length).toBe(0);
  });

  test("missing entityId rejected with 400", async () => {
    const res = await post({ entityType: "person" });
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  test("malformed JSON body → 400", async () => {
    const res = await POST(
      new Request("http://localhost/api/follows", { method: "POST", body: "{not json" })
    );
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/follows", () => {
  test("removes an existing follow", async () => {
    await post({ entityType: "company", entityId: "berkshire" });
    expect(db.follow.rows.length).toBe(1);
    const res = await del("entityType=company&entityId=berkshire");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, following: false });
    expect(db.follow.rows.length).toBe(0);
  });

  test("invalid query params → 400", async () => {
    const res = await del("entityType=nope&entityId=x");
    expect(res.status).toBe(400);
    const missing = await del("entityId=only-id");
    expect(missing.status).toBe(400);
  });
});

describe("GET /api/follows", () => {
  test("returns user's follows newest-first with no-store cache header", async () => {
    await db.follow.upsert({
      where: { userId_entityType_entityId: { userId: "user-1", entityType: "person", entityId: "older" } },
      update: {},
      create: { userId: "user-1", entityType: "person", entityId: "older" },
    });
    // ensure distinct createdAt ordering
    db.follow.rows[0].createdAt = new Date(Date.now() - 60_000);
    await db.follow.upsert({
      where: { userId_entityType_entityId: { userId: "user-1", entityType: "topic", entityId: "newer" } },
      update: {},
      create: { userId: "user-1", entityType: "topic", entityId: "newer" },
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    const body = await res.json();
    expect(body.follows.map((f: AnyRow) => f.entityId)).toEqual(["newer", "older"]);
  });
});
