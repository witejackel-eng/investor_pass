import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { CheckoutResult, PaymentProvider, Variant } from "./provider";
import { planIdFor } from "./provider";

const API = "https://api.razorpay.com/v1";

function auth(): string {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new Error("Razorpay keys not configured");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export function razorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_PLAN_MONTHLY &&
      process.env.RAZORPAY_PLAN_ANNUAL
  );
}

async function rz(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: auth(), "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`Razorpay ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

export async function verifyRazorpaySignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export const razorpay: PaymentProvider = {
  name: "razorpay",
  configured: razorpayConfigured,

  async createCheckout(variant: Variant): Promise<CheckoutResult> {
    const planId = planIdFor("razorpay", variant);
    if (!planId) return { mode: "unconfigured", reason: `RAZORPAY_PLAN_${variant.toUpperCase()} missing` };
    const sub = (await rz("/subscriptions", {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, total_count: variant === "monthly" ? 120 : 10, customer_notify: 1 }),
    })) as { id?: string; short_url?: string };
    if (!sub.id) return { mode: "unconfigured", reason: "subscription creation failed" };
    return sub.short_url
      ? { mode: "redirect", url: sub.short_url, providerRef: sub.id }
      : { mode: "unconfigured", reason: "short_url missing — enable hosted checkout or wire Checkout.js" };
  },

  async cancel(providerRef: string): Promise<boolean> {
    try {
      await rz(`/subscriptions/${providerRef}/cancel`, { method: "POST", body: JSON.stringify({ cancel_at_cycle_end: 1 }) });
      return true;
    } catch {
      return false;
    }
  },
};

export function mapRazorpayEvent(event: string): string | undefined {
  const map: Record<string, string> = {
    "subscription.activated": "active",
    "subscription.charged": "active",
    "subscription.pending": "past_due",
    "subscription.halted": "past_due",
    "subscription.cancelled": "canceled",
    "subscription.completed": "expired",
    "subscription.expired": "expired",
  };
  return map[event];
}
