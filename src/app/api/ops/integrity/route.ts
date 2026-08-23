/**
 * GET /api/ops/integrity — run/refresh the §53 data-integrity checks.
 * POST body { force: true } forces re-run (RUN CHECK).
 */
import { NextResponse } from "next/server";
import { getIntegrity } from "@/lib/ops/integrity";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("force") === "1";
  try {
    const results = await getIntegrity(force);
    return NextResponse.json(
      { at: new Date().toISOString(), results },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json({ error: "Integrity run failed", detail: e instanceof Error ? e.message.slice(0, 300) : String(e) }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
