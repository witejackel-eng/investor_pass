/**
 * /api/bookmarks route tests (Pro-gated writes; reads for any authed user).
 * Note: this route's requireUser() throws and is caught → 401, unlike
 * follows/notifications which check the user inline.
 */
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { createDb, mkUser, type AnyRow } from "./helpers/fakedb";

const state: { user: AnyRow | null } = { user: null };
const db = createDb();

mock.module("@/lib/auth/session", () => ({
  getSessionUser: async () => state.user,
}));
mock.module("@/lib/db", () => ({ db }));

const { GET, POST, DELETE } = await import("@/app/api/bookmarks/route");

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/bookmarks", { method: "POST", body: JSON.stringify(body) }));

beforeEach(() => {
  db.bookmark.rows.length = 0;
  state.user = mkUser({ id: "user-1", entitlement: "pro" });
});

describe("auth + entitlement gates", () => {
  test("guest gets 401 on POST", async () => {
    state.user = null;
    const res = await post({ kind: "source", entityId: "s1" });
    expect(res.status).toBe(401);
    expect(db.bookmark.rows.length).toBe(0);
  });

  test("free user gets 403 on POST — entitlement is checked before body parsing", async () => {
    state.user = mkUser({ id: "user-2", entitlement: "free" });
    const res = await post({ kind: "source", entityId: "s1" });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/pro/i);
    expect(db.bookmark.rows.length).toBe(0);
  });
});

describe("CRUD happy path (pro user)", () => {
  test("POST creates, second POST same key updates instead of duplicating; GET lists newest-first", async () => {
    const r1 = await post({ kind: "passage", entityId: "p1", label: "First", note: "n1" });
    expect(r1.status).toBe(200);
    const b1 = (await r1.json()).bookmark;
    expect(b1.kind).toBe("passage");
    expect(b1.note).toBe("n1");

    // ensure ordering is deterministic
    db.bookmark.rows[0].createdAt = new Date(Date.now() - 60_000);
    const r2 = await post({ kind: "passage", entityId: "p2", label: "Second" });
    expect(r2.status).toBe(200);

    const r3 = await post({ kind: "passage", entityId: "p1", label: "Relabeled" });
    const b3 = (await r3.json()).bookmark;
    expect(b3.label).toBe("Relabeled");
    expect(db.bookmark.rows.length).toBe(2); // upsert, not duplicate

    const list = await (await GET()).json();
    expect(list.bookmarks.map((b: AnyRow) => b.entityId)).toEqual(["p2", "p1"]);
  });

  test("validation: invalid kind and missing fields → 400", async () => {
    expect((await post({ kind: "stonk", entityId: "gme" })).status).toBe(400);
    expect((await post({ kind: "source" })).status).toBe(400);
    expect(db.bookmark.rows.length).toBe(0);
  });

  test("DELETE removes by kind+entityId; repeat delete stays ok (deleteMany)", async () => {
    await post({ kind: "company", entityId: "brk" });
    const url = "kind=company&entityId=brk";
    const res = await DELETE(new Request(`http://localhost/api/bookmarks?${url}`, { method: "DELETE" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(db.bookmark.rows.length).toBe(0);

    const again = await DELETE(new Request(`http://localhost/api/bookmarks?${url}`, { method: "DELETE" }));
    expect(again.status).toBe(200);

    const missingParams = await DELETE(
      new Request("http://localhost/api/bookmarks?kind=company", { method: "DELETE" })
    );
    expect(missingParams.status).toBe(400);
  });

  test("GET guest also gets 401 (reads do not require pro, only a session)", async () => {
    state.user = null;
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
