import "server-only";
import { db } from "@/lib/db";

/**
 * Write-time notification fan-out (Master Plan §1-2, Tech Plan §7).
 * Called once per import AFTER rows are committed: resolve followers of the
 * affected entities, batch-insert notifications. Zero read-time cost.
 * Capped + chunked so huge imports can't explode writes.
 */
const MAX_FOLLOWERS_PER_IMPORT = 500;

export async function fanOutNewSource(opts: {
  personSlug?: string | null;
  personName?: string | null;
  sourceSlug: string;
  sourceTitle: string;
  year?: number | null;
  passageCount: number;
}) {
  if (!opts.personSlug) return;
  try {
    const follows = await db.follow.findMany({
      where: { entityType: "person", entityId: opts.personSlug },
      select: { userId: true },
      take: MAX_FOLLOWERS_PER_IMPORT,
    });
    if (follows.length === 0) return;

    const title = opts.personName ? `${opts.personName}: new material indexed` : "New material indexed";
    const body = `${opts.passageCount} passages from “${opts.sourceTitle}”${opts.year ? ` (${opts.year})` : ""} are now searchable.`;
    const url = `/sources/${encodeURIComponent(opts.sourceSlug)}`;

    await db.notification.createMany({
      data: follows.map((f) => ({
        userId: f.userId,
        type: "new_source",
        title,
        body,
        url,
        entityType: "person",
        entityId: opts.personSlug as string,
      })),
    });
  } catch {
    // Fan-out must never fail the import itself.
  }
}
