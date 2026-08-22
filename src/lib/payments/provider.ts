import "server-only";

export type Variant = "monthly" | "annual";
export type ProviderName = "razorpay" | "paypal";
export type Currency = "INR" | "USD";

export type CheckoutResult =
  | { mode: "redirect"; url: string; providerRef: string }
  | { mode: "unconfigured"; reason: string };

export interface PaymentProvider {
  name: ProviderName;
  configured(): boolean;
  createCheckout(variant: Variant): Promise<CheckoutResult>;
  cancel(providerRef: string): Promise<boolean>;
}

export function paymentsMode(): "mock" | "live" {
  return process.env.PAYMENTS_MODE === "live" ? "live" : "mock";
}

export const SUBSCRIPTION_STATE_BY_EVENT: Record<string, string> = {
  // razorpay
  "subscription.activated": "active",
  "subscription.charged": "active",
  "subscription.pending": "past_due",
  "subscription.halted": "past_due",
  "subscription.cancelled": "canceled",
  "subscription.completed": "expired",
  "subscription.expired": "expired",
  // paypal
  "BILLING.SUBSCRIPTION.ACTIVATED": "active",
  "BILLING.SUBSCRIPTION.UPDATED": "active",
  "PAYMENT.SALE.COMPLETED": "active",
  "BILLING.SUBSCRIPTION.SUSPENDED": "past_due",
  "PAYMENT.SALE.DENIED": "past_due",
  "BILLING.SUBSCRIPTION.CANCELLED": "canceled",
  "BILLING.SUBSCRIPTION.EXPIRED": "expired",
};

export function planIdFor(provider: ProviderName, variant: Variant): string | undefined {
  const key =
    provider === "razorpay"
      ? `RAZORPAY_PLAN_${variant.toUpperCase()}`
      : `PAYPAL_PLAN_${variant.toUpperCase()}`;
  return process.env[key];
}
