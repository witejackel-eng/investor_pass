/**
 * /api/digest route tests — the pro-gated weekly brief.
 * Free users receive a 200 "gate payload" (not an error), guests get a
 * 401 with the same gated shape. Pro users get grouped notifications
 * from the past 7 days only, sorted by count desc.
 */
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { createDb, mkUser, nid, daysAgo, type AnyRow } from "./helpers/fakedb";

const state: { user: AnyRow | null } = { user: null };
const db = createDb();

mock.module("@/lib/auth/session", () => ({
  getSessionUser: async () => state.user,
}));
mock.module("@/lib/db", () => ({ db }));

const { GET } = await import("@/app/api/digest/route");

function seedNotification(over: AnyRow) {
  db.notification.rows.push({
    id: nid("ntf"),
    userId: over.userId,
    type: "new_source",
    title: over.title ?? "t",
    body: "b",
    url: "/u",
    entityType: over.entityType,
    entityId: over.entityId,
    readAt: null,
    createdAt: over.createdAt,
  });
}

beforeEach(() => {
  db.notification.rows.length = 0;
  state.user = mkUser({ id: "user-1", entitlement: "pro" });
});

describe("GET /api/digest", () => {
  test("guest gets 401 with gated:false-user shape", async () => {
    state.user = null;
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ isPro: false, gated: true });
  });

  test("free user gets 200 upgrade payload — never an email, never an error", async () => {
    state.user = mkUser({ id: "user-1", entitlement: "free" });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isPro).toBe(false);
    expect(body.gated).toBe(true);
    expect(body.message).toMatch(/pro/i);
    // gate short-circuits before any notification query would matter
  });

  test("pro user gets 7-day window aggregated by entity, sorted by count desc", async () => {
    seedNotification({ userId: "user-1", entityType: "person", entityId: "buffett", title: "older hit", createdAt: daysAgo(2) });
    seedNotification({ userId: "user-1", entityType: "person", entityId: "buffett", title: "newer hit", createdAt: daysAgo(1) });
    seedNotification({ userId: "user-1", entityType: "topic", entityId: "markets", title: "topic hit", createdAt: daysAgo(0.5) });
    seedNotification({ userId: "user-1", entityType: "person", entityId: "buffett", title: "too old", createdAt: daysAgo(10) }); // outside window
    seedNotification({ userId: "user-2", entityType: "person", entityId: "munger", title: "foreign", createdAt: daysAgo(1) }); // other user

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isPro).toBe(true);
    expect(body.gated).toBe(false);
    expect(body.totalNew).toBe(3); // window + ownership filters applied
    expect(body.groups.length).toBe(2);
    expect(body.groups[0]).toEqual({
      entityType: "person",
      entityId: "buffett",
      count: 2,
      latestTitle: "newer hit",
    });
    expect(body.groups[1].entityId).toBe("markets");
    expect(typeof body.weekOf).toBe("string");
  });
});
