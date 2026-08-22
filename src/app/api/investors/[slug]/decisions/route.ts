/**
 * GET /api/investors/[slug]/decisions — Decision Ledger (Master Plan §19-20).
 * Free tier: first 3 verified entries + total count. Pro: full ledger.
 * Chronological; outcome provenance links included for every entry.
 */
import { db } from "@/lib/db";
import { error } from "@/lib/api";
import { getSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FREE_LEDGER_LIMIT = 3;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const person = await db.person.findUnique({ where: { slug }, select: { id: true, name: true } });
  if (!person) return error("Investor not found", 404);

  const user = await getSessionUser();
  const isPro = user?.entitlement === "pro";

  const all = await db.decision.findMany({
    where: { personId: person.id, verified: true },
    orderBy: [{ decisionDate: "asc" }, { createdAt: "asc" }],
  });

  const visible = isPro ? all : all.slice(0, FREE_LEDGER_LIMIT);

  return NextResponse.json(
    {
      investor: slug,
      isPro,
      total: all.length,
      visibleCount: visible.length,
      hiddenCount: Math.max(0, all.length - visible.length),
      decisions: visible.map((d) => ({
        id: d.id,
        title: d.title,
        date: d.decisionDate ?? d.date,
        action: d.action,
        statement: d.statement,
        outcome: d.outcome,
        outcomeSourceUrl: d.outcomeSourceUrl,
        confidence: d.confidence,
        verified: d.verified,
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
