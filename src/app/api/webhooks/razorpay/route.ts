import { mapRazorpayEvent, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { applySubscriptionStateByRef } from "@/lib/payments/apply";

export const dynamic = "force-dynamic";

// POST /api/webhooks/razorpay — signature-verified, fail-closed
export async function POST(req: Request) {
  const raw = await req.text();
  const ok = await verifyRazorpaySignature(raw, req.headers.get("x-razorpay-signature"));
  if (!ok) return new Response("invalid signature", { status: 400 });

  try {
    const evt = JSON.parse(raw) as { event?: string; payload?: { subscription?: { entity?: { id?: string } } } };
    const state = evt.event ? mapRazorpayEvent(evt.event) : undefined;
    const ref = evt.payload?.subscription?.entity?.id;
    if (state && ref) await applySubscriptionStateByRef("razorpay", ref, state);
  } catch {
    // never leak errors to processors
  }
  return new Response(null, { status: 200 });
}
