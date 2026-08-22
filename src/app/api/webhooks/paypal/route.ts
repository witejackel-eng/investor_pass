import { mapPayPalEvent, verifyPayPalWebhook } from "@/lib/payments/paypal";
import { applySubscriptionStateByRef } from "@/lib/payments/apply";

export const dynamic = "force-dynamic";

interface PayPalEvent {
  event_type?: string;
  resource?: { id?: string; billing_agreement_id?: string };
}

// POST /api/webhooks/paypal — API-verified, fail-closed
export async function POST(req: Request) {
  const raw = await req.text();
  let evt: PayPalEvent;
  try {
    evt = JSON.parse(raw);
  } catch {
    return new Response("bad body", { status: 400 });
  }
  const ok = await verifyPayPalWebhook(req.headers, raw);
  if (!ok) return new Response("invalid signature", { status: 400 });

  const state = evt.event_type ? mapPayPalEvent(evt.event_type) : undefined;
  const ref = evt.resource?.id ?? evt.resource?.billing_agreement_id;
  if (state && ref) {
    try {
      await applySubscriptionStateByRef("paypal", ref, state);
    } catch {
      // never leak errors to processors
    }
  }
  return new Response(null, { status: 200 });
}
