import "server-only";
import type { CheckoutResult, PaymentProvider, Variant } from "./provider";
import { planIdFor } from "./provider";

const API = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

function configured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      process.env.PAYPAL_WEBHOOK_ID &&
      process.env.PAYPAL_PLAN_MONTHLY &&
      process.env.PAYPAL_PLAN_ANNUAL
  );
}

async function token(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials not configured");
  const res = await fetch(`${API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth ${res.status}`);
  const j = (await res.json()) as { access_token: string };
  return j.access_token;
}

export async function verifyPayPalWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  try {
    const t = await token();
    const res = await fetch(`${API}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    });
    const j = (await res.json()) as { verification_status?: string };
    return j.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

export const paypal: PaymentProvider = {
  name: "paypal",
  configured,

  async createCheckout(variant: Variant): Promise<CheckoutResult> {
    const planId = planIdFor("paypal", variant);
    if (!planId) return { mode: "unconfigured", reason: `PAYPAL_PLAN_${variant.toUpperCase()} missing` };
    const t = await token();
    const res = await fetch(`${API}/v1/billing/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId }),
    });
    if (!res.ok) throw new Error(`PayPal subscription ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const j = (await res.json()) as { id: string; links: { rel: string; href: string }[] };
    const approve = j.links?.find((l) => l.rel === "approve")?.href;
    if (!approve) return { mode: "unconfigured", reason: "approve link missing" };
    return { mode: "redirect", url: approve, providerRef: j.id };
  },

  async cancel(providerRef: string): Promise<boolean> {
    try {
      const t = await token();
      const res = await fetch(`${API}/v1/billing/subscriptions/${providerRef}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      return res.status === 204 || res.ok;
    } catch {
      return false;
    }
  },
};

export function mapPayPalEvent(eventType: string): string | undefined {
  const map: Record<string, string> = {
    "BILLING.SUBSCRIPTION.ACTIVATED": "active",
    "BILLING.SUBSCRIPTION.UPDATED": "active",
    "PAYMENT.SALE.COMPLETED": "active",
    "BILLING.SUBSCRIPTION.SUSPENDED": "past_due",
    "PAYMENT.SALE.DENIED": "past_due",
    "BILLING.SUBSCRIPTION.CANCELLED": "canceled",
    "BILLING.SUBSCRIPTION.EXPIRED": "expired",
  };
  return map[eventType];
}
