/**
 * GET /api/ops/issues — aggregate issue feed: integrity FAIL/WARNING items
 * + acknowledged state (AppConfig `ops:ack:<id>`). POST { id } acks.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getIntegrity } from "@/lib/ops/integrity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await getIntegrity();
    const acks = await db.appConfig.findMany({ where: { key: { startsWith: "ops:ack:" } } });
    const ackSet = new Set(acks.map((a) => a.key.slice("ops:ack:".length)));
    const issues = results
      .filter((r) => r.status === "ISSUES")
      .map((r) => ({
        id: r.id,
        priority: r.severity === "FAIL" ? "P0" : "P2",
        title: r.title,
        area: "data-integrity",
        count: r.count,
        detail: r.detail,
        sample: r.sample,
        ack: ackSet.has(r.id),
      }));
    return NextResponse.json({ at: new Date().toISOString(), issues }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "Issues unavailable", detail: e instanceof Error ? e.message.slice(0, 300) : String(e) }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: Request) {
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id || !/^[\w-]+$/.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    await db.appConfig.upsert({
      where: { key: `ops:ack:${id}` },
      update: { value: new Date().toISOString() },
      create: { key: `ops:ack:${id}`, value: new Date().toISOString() },
    });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Ack failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
