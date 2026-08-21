import { db } from "@/lib/db";
import { json } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const [concepts, events] = await Promise.all([
    db.concept.findMany({ orderBy: { name: "asc" } }),
    db.event.findMany({ orderBy: { name: "asc" } }),
  ]);
  return json({ concepts, events });
}
