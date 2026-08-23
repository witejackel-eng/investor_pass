# Investor/Pass — Canonical Payments Spec v1.0 (LOCKED)

> Status: **Approved by product owner** — supersedes all prior Lemon Squeezy references anywhere in the repo.
> Processors: **Razorpay (primary) + PayPal (secondary)**. Owner holds live accounts on both.
> This document is the source of truth for checkout, webhooks, and entitlement.

---

## 1. Locked pricing matrix

| Currency | Monthly | Annual | Processor | Default for |
|---|---|---|---|---|
| 🇮🇳 INR | **₹499** | **₹3,999** | Razorpay | India (auto-detected), selectable by anyone |
| 🌍 USD | **$9** | **$79** | PayPal **or** Razorpay-international | Rest of world |

Rules:

- Region detection at checkout: IP geolocation → India defaults to INR/Razorpay; elsewhere defaults to USD with both processors offered. User can always switch currency AND processor manually.
- Annual framing copy: USD `$79/year — save 27%`; INR `₹3,999/year — save 33%`.
- No other tiers, no lifetime deals, no coupons at launch (spec §27).
- All prices are tax-exclusive display, subject to §5 compliance notes.

---

## 2. Processor roles & failure posture

```
                CHECKOUT PAGE
                     │
        region detect + user choice
          ┌──────────┴──────────┐
      INDIA / INR         INTERNATIONAL / USD
       RAZORPAY           ┌────────┴────────┐
     (UPI·cards·NB)    PAYPAL        RAZORPAY-INTL
```

- **Razorpay is the primary rail globally.** PayPal exists as choice/failover for buyers who prefer it.
- If one processor's webhooks degrade, entitlement flips from the OTHER rail continue working. Never hard-code single-provider assumptions outside `src/lib/payments/`.

---

## 3. Subscription state machine (already in Prisma schema)

`Subscription.state`: `free → checkout_started → active ⇄ past_due → canceled | expired`
`Subscription.entitlement`: derived — only `active` (and grace-window `past_due`) ⇒ `"pro"`.

### Webhook event mapping

| Processor event | Maps to state |
|---|---|
| Razorpay `subscription.activated` / `subscription.charged` | `active` |
| Razorpay `subscription.pending` / `halted` | `past_due` |
| Razorpay `subscription.cancelled` | `canceled` |
| Razorpay `subscription.completed` / `expired` | `expired` |
| PayPal `BILLING.SUBSCRIPTION.ACTIVATED` / `.PAYMENT.SALE.COMPLETED` | `active` |
| PayPal `PAYMENT.SALE.DENIED` / `BILLING.SUBSCRIPTION.SUSPENDED` | `past_due` |
| PayPal `BILLING.SUBSCRIPTION.CANCELLED` | `canceled` |
| PayPal `BILLING.SUBSCRIPTION.EXPIRED` | `expired` |

Entitlement flip logic stays exactly as proven in the mock E2E: webhook → verify signature → find user by `subscription.providerRef` → update `Subscription` + `User.entitlement` server-side. **No client signal ever grants Pro.**

---

## 4. Build tasks (orchestrator queue)

1. **Schema**: add `provider String?` (`razorpay|paypal`) and `providerRef String?` (processor subscription id) to `Subscription`. Migration + push.
2. **Config/env** (add to `.env.example`, never commit real values):
   ```
   RAZORPAY_KEY_ID= · RAZORPAY_KEY_SECRET=
   RAZORPAY_WEBHOOK_SECRET=
   RAZORPAY_PLAN_MONTHLY= · RAZORPAY_PLAN_ANNUAL=     # plan_ids for ₹499 / ₹3,999
   PAYPAL_CLIENT_ID= · PAYPAL_CLIENT_SECRET= · PAYPAL_WEBHOOK_ID=
   PAYPAL_PLAN_MONTHLY= · PAYPAL_PLAN_ANNUAL=
   PUBLIC_SITE_URL= (exists)
   ```
   One-time setup: create 2 Razorpay Plans (₹499/mo, ₹3,999/yr) + 2 PayPal Plans ($9/$79); paste IDs into env. ⚠️ LAUNCH PRICING — update plan amounts in both dashboards to match.
3. **`src/lib/payments/provider.ts`** — interface `{ createCheckout(userId, variant, currency): Promise<{redirectUrl}> , verifyWebhook(req): Event }` with `razorpay.ts` + `paypal.ts` adapters. Replaces the mock in `/api/checkout` behind the same route contract.
4. **`/api/webhooks/razorpay`** — raw-body HMAC-SHA256 check against `RAZORPAY_WEBHOOK_SECRET` (header `x-razorpay-signature`) BEFORE parsing JSON.
5. **`/api/webhooks/paypal`** — verify via PayPal `verify-webhook-signature` API using `PAYPAL_WEBHOOK_ID`.
6. **UpgradeView** — currency toggle (INR⇄USD, region-defaulted) + two processor buttons per currency where applicable. Copy: `Pro — ₹499/month`, `Pro — $9/month`, annual equivalents.
7. **Account page** — show plan, renewal date, provider, cancel action (cancel = processor API call + our state machine handles the rest).

---

## 5. Compliance notes (seller of record = owner)

- Lemon Squeezy previously implied merchant-of-record coverage. With own processors, **the owner is the seller of record** for all jurisdictions.
- India GST: exports of services generally 0% with LUT filing; domestic sales attract GST above registration thresholds. → One-time CA consult recommended; not a launch blocker.
- EU/UK digital-services VAT: technically chargeable to consumers even at low volume; standard indie practice is defer-and-monitor until revenue is material. Recorded here so it is a known, accepted risk rather than an oversight.
- Refunds: honor within 7 days no-questions (builds trust, negligible cost). Process manually via processor dashboards at this scale.

---

## 6. Acceptance checklist (payments lane done when)

- [ ] INR checkout creates real Razorpay subscription; test-mode webhook flips DB state to `active` + entitlement `pro`
- [ ] Same E2E for PayPal USD sandbox
- [ ] Tampered webhook request rejected (signature check proven)
- [ ] Anonymous/free client cannot trigger entitlement by any API call (regression: old mock path removed)
- [ ] UpgradeView shows correct currency/pricing per region selection
- [ ] Cancel via account page → processor cancelled → next webhook sets `canceled`, access persists to period end
- [ ] `bun run lint` clean; all existing API routes still 200

---

*Locked by product owner. Implementation owned by orchestrator agent.*
