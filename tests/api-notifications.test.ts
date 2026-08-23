/**
 * /api/notifications route tests — inbox listing + mark-read scoping.
 * Key security property: updateMany wheres always include userId, so a user
 * can never mark another user's notifications read.
 */
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { createDb, mkUser, nid, type AnyRow } from "./helpers/fakedb";

const state: { user: AnyRow | null } = { user: null };
const db = createDb();

mock.module("@/lib/auth/session", () => ({
  getSessionUser: async () => state.user,
}));
mock.module("@/lib/db", () => ({ db }));

const { GET, POST } = await import("@/app/api/notifications/route");

function seedNotification(over: AnyRow): AnyRow {
  const row = {
    id: over.id ?? nid("ntf"),
    userId: over.userId,
    type: over.type ?? "new_source",
    title: over.title ?? "A title",
    body: over.body ?? "A body",
    url: over.url ?? "/somewhere",
    entityType: over.entityType ?? "person",
    entityId: over.entityId ?? "buffett",
    readAt: over.readAt ?? null,
    createdAt: over.createdAt ?? new Date(),
  };
  db.notification.rows.push(row);
  return row;
}

beforeEach(() => {
  db.notification.rows.length = 0;
  state.user = mkUser({ id: "user-1" });
});

describe("GET /api/notifications", () => {
  test("guest gets 401", async () => {
    state.user = null;
    expect((await GET()).status).toBe(401);
  });

  test("returns unreadCount and read flag mapped from readAt, latest first", async () => {
    seedNotification({ userId: "user-1", title: "older", createdAt: new Date(Date.now() - 5000) });
    seedNotification({
      userId: "user-1",
      title: "newer",
      createdAt: new Date(),
      readAt: new Date(Date.now() - 1000),
    });
    seedNotification({ userId: "someone-else", title: "foreign" }); // must be invisible

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    const body = await res.json();
    expect(body.unreadCount).toBe(1); // foreign + read rows don't count
    expect(body.notifications.map((n: AnyRow) => n.title)).toEqual(["newer", "older"]);
    expect(body.notifications[0].read).toBe(true);
    expect(body.notifications[1].read).toBe(false);
    // raw readAt is not leaked to clients
    expect(body.notifications[0]).not.toHaveProperty("readAt");
    expect(body.notifications[0]).not.toHaveProperty("userId");
  });
});

describe("POST /api/notifications (mark read)", () => {
  test("{ all:true } marks only the caller's unread rows", async () => {
    const mineUnread = seedNotification({ userId: "user-1" });
    seedNotification({ userId: "user-1", readAt: new Date() }); // already read
    const foreign = seedNotification({ userId: "user-2" });

    const res = await POST(
      new Request("http://localhost/api/notifications", { method: "POST", body: JSON.stringify({ all: true }) })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mineUnread.readAt).not.toBeNull();
    expect(foreign.readAt).toBeNull();
  });

  test("{ ids:[...] } ignores ids belonging to other users", async () => {
    const foreign = seedNotification({ userId: "user-2" });
    const mine = seedNotification({ userId: "user-1" });

    const res = await POST(
      new Request("http://localhost/api/notifications", {
        method: "POST",
        body: JSON.stringify({ ids: [foreign.id, mine.id] }),
      })
    );
    expect(res.status).toBe(200);
    expect(mine.readAt).not.toBeNull();
    expect(foreign.readAt).toBeNull(); // cross-user id silently skipped
  });

  test("empty/malformed body is treated as no-op {ok:true}, nothing marked", async () => {
    seedNotification({ userId: "user-1" });
    const res = await POST(
      new Request("http://localhost/api/notifications", { method: "POST", body: "{broken" })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(db.notification.rows.every((r) => r.readAt === null)).toBe(true);
  });
});
