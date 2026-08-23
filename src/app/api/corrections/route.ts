/**
 * POST /api/corrections — submit a correction report (Master Plan §35).
 * Anyone can report; submissions enter a review queue. Rate-limited,
 * length-capped, PII-light.
 */
import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const KINDS = new Set(["passage", "source", "decision", "company", "theme", "event"]);
const TYPES = new Set(["factual", "sourcing", "attribution", "tagging", "duplicate", "other"]);

export async function POST(req: Request) {
  const rl = rateLimit(`correction:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) return error("Too many reports. Please try again later.", 429);

  let body: {
    entityKind?: string;
    entityId?: string;
    issueType?: string;
    message?: string;
    email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const entityKind = (body.entityKind || "").trim();
  const entityId = (body.entityId || "").trim();
  const issueType = (body.issueType || "other").trim();
  const message = (body.message || "").trim();

  if (!KINDS.has(entityKind)) return error("A valid entity kind is required", 400);
  if (!entityId || entityId.length > 128) return error("A valid entity id is required", 400);
  if (!TYPES.has(issueType)) return error("A valid issue type is required", 400);
  if (message.length < 10) return error("Please describe the issue (at least 10 characters)", 400);
  if (message.length > 2000) return error("Please keep the description under 2000 characters", 400);

  const email = (body.email || "").trim().toLowerCase();
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return error("A valid email is required if provided", 400);
  }

  try {
    const correction = await db.correction.create({
      data: {
        entityKind,
        entityId,
        issueType,
        message,
        submitterEmail: email || null,
      },
    });
    return json({
      ok: true,
      id: correction.id,
      message: "Report received. Our editorial team reviews every submission.",
    });
  } catch {
    return error("Could not submit right now. Please try again.", 500);
  }
}
