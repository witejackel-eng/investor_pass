// Legal documents for Investor/Pass.
// Single source of truth rendered at /legal and /legal/[slug].
// TODO(operator): fill OPERATOR fields before production launch.

export const OPERATOR = {
  name: "Investor/Pass",
  legalEntity: "[Insert registered entity / operator name]",
  email: "contact@investorpass.app",
  jurisdiction: "[Insert governing jurisdiction, e.g., India]",
  address: "[Insert registered address]",
};

export const LEGAL_UPDATED = "2026-08-22";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

const CONTACT_SECTION: LegalSection = {
  heading: "Contact",
  paragraphs: [
    `Questions, requests, or notices under this document may be directed to ${OPERATOR.email} or to ${OPERATOR.address}. Include enough detail for us to identify you and act on your request.`,
  ],
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    kicker: "LEGAL",
    description:
      "The terms governing use of Investor/Pass: accounts, subscriptions, acceptable use, intellectual property, disclaimers, and liability.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        heading: "1. Agreement",
        paragraphs: [
          "These Terms of Service (\"Terms\") govern your access to and use of Investor/Pass, including the website at investorpass.vercel.app and any related pages, features, or services (collectively, the \"Service\"). By creating an account, subscribing, or otherwise using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
          "Investor/Pass is operated by " + OPERATOR.legalEntity + " (\"we\", \"us\"). We may change these Terms; material changes will be announced on the Service. Continued use after changes take effect constitutes acceptance of the revised Terms.",
        ],
      },
      {
        heading: "2. Eligibility and Accounts",
        paragraphs: [
          "You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account or subscribe. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorized use.",
          "You agree to provide accurate registration information and to keep it current. One person or entity per account; account sharing is not permitted.",
        ],
      },
      {
        heading: "3. What the Service Is",
        paragraphs: [
          "Investor/Pass is a research and reference product. It indexes, structures, and connects paraphrased contextual summaries of publicly available investor communications — shareholder letters, memos, interviews, speeches, filings, and similar records — together with themes, companies, events, decisions, and source attributions.",
          "The Service is educational and historical in nature. It is not investment advice, a broker-dealer service, a financial product, or a recommendation engine. See our Investment Disclaimer at /legal/disclaimer.",
        ],
      },
      {
        heading: "4. Subscriptions and Billing",
        paragraphs: [
          "Access beyond the free tier requires a paid subscription billed monthly (US$9) or annually (US$79), or the equivalent regional price displayed at checkout (including INR pricing where offered). Prices are exclusive of applicable taxes unless stated otherwise.",
          "Payments are processed by third-party processors (Razorpay, PayPal). We do not receive or store your full payment-card details. Subscriptions auto-renew at the end of each billing period until cancelled. You may cancel at any time as described in our Refund & Cancellation Policy at /legal/refunds; cancellation stops future charges and your access continues to the end of the paid period.",
          "We may change prices with prospective effect and reasonable prior notice; changes will not apply retroactively to periods already paid.",
        ],
      },
      {
        heading: "5. Acceptable Use",
        paragraphs: ["You agree not to:"],
        bullets: [
          "scrape, bulk-export, systematically copy, or redistribute substantial portions of the Service's indexed content, including premium passages;",
          "share, resell, or publish your account access or premium content outside your personal use;",
          "use the Service to build a competing database or training corpus;",
          "interfere with the Service's operation, probe its security, or circumvent entitlement or access controls;",
          "misrepresent the Service's paraphrased summaries as verbatim quotations of the underlying sources;",
          "violate applicable laws or third-party rights while using the Service.",
        ],
      },
      {
        heading: "6. Intellectual Property",
        paragraphs: [
          "The Service's structure, editorial summaries, software, design, and databases are owned by us or our licensors and protected by intellectual-property law. Underlying source documents remain the property of their respective owners; we claim no ownership over them and provide attribution and links where legitimately available.",
          "Our copyright method, attribution standards, and notice-and-takedown procedure are described at /legal/copyright.",
        ],
      },
      {
        heading: "7. Availability and Changes",
        paragraphs: [
          "We aim for continuous availability but do not guarantee uninterrupted access. We may add, modify, suspend, or remove features, entities, or content. If we terminate your access without cause other than non-payment or breach, we will refund the unused pro-rated portion of a prepaid annual subscription.",
        ],
      },
      {
        heading: "8. Disclaimers and Limitation of Liability",
        paragraphs: [
          "The Service is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including accuracy, completeness, merchantability, fitness for a particular purpose, or non-infringement. Summaries are paraphrases and may contain errors; see /legal/disclaimer.",
          "To the maximum extent permitted by law, our aggregate liability arising from or relating to the Service is limited to the amount you paid us in the twelve months preceding the claim. We are not liable for indirect, incidental, special, consequential, or punitive damages, or for any trading, investment, or financial losses, however caused.",
        ],
      },
      {
        heading: "9. Indemnity and Termination",
        paragraphs: [
          "You agree to indemnify and hold us harmless from claims arising out of your misuse of the Service or breach of these Terms.",
          "We may suspend or terminate accounts that violate these Terms, infringe others' rights, or create risk for us. You may close your account at any time by contacting " + OPERATOR.email + ". Sections that should survive termination (intellectual property, disclaimers, liability) do so.",
        ],
      },
      {
        heading: "10. Governing Law",
        paragraphs: [
          "These Terms are governed by the laws of " + OPERATOR.jurisdiction + ", without regard to conflict-of-laws rules. Courts located in " + OPERATOR.jurisdiction + " have exclusive jurisdiction, except where mandatory consumer-protection law grants you the courts of your residence.",
        ],
      },
      { ...CONTACT_SECTION },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    kicker: "LEGAL",
    description:
      "What personal data Investor/Pass collects, why, how long it is kept, who it is shared with, and the rights you have over it.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        heading: "1. Scope",
        paragraphs: [
          "This Privacy Policy explains how " + OPERATOR.legalEntity + " (\"we\", \"us\") processes personal data when you visit investorpass.vercel.app, create an account, subscribe, or use the Service. We collect only what the Service needs to function: there are no advertising networks or data brokers in this stack.",
        ],
      },
      {
        heading: "2. Data We Collect",
        bullets: [
          "Account data: email address, optional display name, and a salted hash of your password. We never store plaintext passwords.",
          "Research activity: bookmarks, saved searches, collections, followed entities, research-resume state, and session items — stored so the Service can restore your context across visits.",
          "Product analytics: first-party event records (for example, search queries performed, features opened) optionally linked to your account identifier, used solely to improve retrieval quality and prioritize work.",
          "Subscription metadata: plan, status, currency, provider reference identifiers, and billing-period dates. Full payment details are handled exclusively by our payment processors (Razorpay, PayPal); we do not receive or store complete card numbers.",
          "Technical logs: standard server and hosting logs (including IP address and user agent) retained briefly for security and abuse prevention.",
        ],
      },
      {
        heading: "3. Why We Process It (Legal Bases)",
        bullets: [
          "Performance of our contract with you: operating your account, entitlements, saved research, continuity features, and notifications.",
          "Legitimate interests: securing the Service, preventing abuse, understanding aggregate usage to improve the product.",
          "Consent: optional email digests and any non-essential communications; you may withdraw consent at any time.",
          "Legal obligations: retaining transaction records where law requires.",
        ],
      },
      {
        heading: "4. Sharing and Processors",
        paragraphs: [
          "We do not sell personal data and do not share it for third-party advertising.",
        ],
        bullets: [
          "Hosting and infrastructure: Vercel (application hosting) and Supabase (managed PostgreSQL).",
          "Payments: Razorpay and PayPal process payments under their own privacy terms.",
          "Email delivery (if you opt into digests): our email service provider sends messages on our instruction.",
          "Legal process: disclosure where required by law, court order, or to protect rights and safety.",
        ],
      },
      {
        heading: "5. Cookies and Local Storage",
        paragraphs: [
          "We use a strictly necessary session cookie to keep you signed in, and local storage for preferences such as theme selection. No advertising or cross-site tracking cookies are used. Details: /legal/cookies.",
        ],
      },
      {
        heading: "6. Retention",
        paragraphs: [
          "Account and research data are retained while your account is active. On deletion, account data is removed within 30 days, except records we must retain for tax, fraud, or legal purposes (typically transaction metadata). Analytics events are retained in aggregate form; raw event linkage is minimized.",
        ],
      },
      {
        heading: "7. Your Rights",
        paragraphs: [
          "Depending on your jurisdiction, you have rights to access, correct, export, delete, restrict, or object to processing of your personal data, and to lodge a complaint with a supervisory authority.",
        ],
        bullets: [
          "EU/UK (GDPR): the rights listed above plus withdrawal of consent where processing relies on consent.",
          "India (Digital Personal Data Protection Act, 2023): rights to access, correction, erasure, grievance redressal, and nomination.",
          "California and other US states: we do not sell or share personal information as defined by CCPA/CPRA; you may request disclosure or deletion.",
          "Exercise any right by emailing " + OPERATOR.email + "; we respond within statutory timelines.",
        ],
      },
      {
        heading: "8. Security and Transfers",
        paragraphs: [
          "Data is encrypted in transit (TLS) and at rest by our managed database provider; passwords are hashed. No method is perfectly secure, but access to production data is restricted and logged. Where data crosses borders, we rely on appropriate safeguards provided by our processors.",
        ],
      },
      {
        heading: "9. Children",
        paragraphs: [
          "The Service is not directed at children under 13 (or under 16 in the EEA), and we do not knowingly collect their data. Contact us if you believe a minor has provided data.",
        ],
      },
      {
        heading: "10. Changes",
        paragraphs: [
          "Material changes to this policy will be announced on the Service with an updated date above.",
        ],
      },
      { ...CONTACT_SECTION },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie & Storage Policy",
    kicker: "LEGAL",
    description:
      "Exactly what Investor/Pass stores in your browser: one essential session cookie, one preference key, and nothing else.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        heading: "1. Our Approach",
        paragraphs: [
          "Investor/Pass deliberately uses minimal browser storage. There are no advertising cookies, no cross-site trackers, and no fingerprinting. This page lists everything we store.",
        ],
      },
      {
        heading: "2. Essential Cookie",
        bullets: [
          "Session token cookie — set when you sign in. Purpose: authentication and keeping you signed in. Type: strictly necessary, first-party, HTTP-only. Lifetime: until sign-out or expiry of the session. Without it, sign-in cannot function.",
        ],
      },
      {
        heading: "3. Local Storage",
        bullets: [
          "Theme preference (key such as ip_theme) — remembers light/dark mode so the interface does not flash on return. Purely functional; contains no identifiers.",
        ],
      },
      {
        heading: "4. Analytics Without Cookies",
        paragraphs: [
          "Product analytics are first-party events recorded server-side (search queries, feature usage) and are not tied to third-party cookies or advertising identifiers. They power quality improvements such as search relevance and coverage prioritization.",
        ],
      },
      {
        heading: "5. Controlling Storage",
        paragraphs: [
          "You can clear cookies and site data in your browser settings at any time; clearing the session cookie signs you out. Blocking all cookies will prevent sign-in but public pages remain readable. Do-Not-Track signals do not affect this Service because we run no third-party tracking to honor.",
        ],
      },
      { ...CONTACT_SECTION },
    ],
  },
  {
    slug: "copyright",
    title: "Copyright & IP Notice",
    kicker: "LEGAL",
    description:
      "How Investor/Pass handles copyrighted sources: original paraphrased summaries, full attribution, links to originals, and a formal takedown procedure.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        heading: "1. Editorial Method",
        paragraphs: [
          "Investor/Pass indexes the public record of exceptional investors. Records in the library are original paraphrased contextual summaries — written by our editors to convey what a source said, in our own words. We never reproduce copyrighted works verbatim or in bulk, and we make no claim that short length alone makes any use fair.",
        ],
        bullets: [
          "Every record carries provenance: source title, publisher or venue, publication year, and a link to the original where one is legitimately available.",
          "Source verification states (verified / needs review) are shown honestly; we do not invent verification.",
          "Company names, tickers, and investor names appear editorially for identification and reference; all trademarks belong to their respective owners.",
        ],
      },
      {
        heading: "2. Ownership",
        paragraphs: [
          "The Service's summaries, structure, taxonomy, software, and design are owned by " + OPERATOR.legalEntity + ". Rights in underlying letters, reports, transcripts, and other source materials remain with their authors and publishers.",
        ],
      },
      {
        heading: "3. Notice and Takedown Procedure",
        paragraphs: [
          "If you are a rights owner (or authorized agent) and believe content on the Service infringes your copyright, send a notice to " + OPERATOR.email + " with subject line \"Copyright Notice\" including:",
        ],
        bullets: [
          "identification of the copyrighted work claimed to be infringed;",
          "the exact URL(s) on the Service you dispute;",
          "your contact details (name, address, email, phone);",
          "a statement of good-faith belief that the use is unauthorized by the owner, its agent, or law;",
          "a statement, under penalty of perjury, that the information is accurate and you are the owner or authorized agent;",
          "your physical or electronic signature.",
        ],
      },
      {
        heading: "3b. Action on Valid Notices",
        paragraphs: [
          "Valid notices are actioned promptly — typically removing or revising the disputed summary while preserving neutral bibliographic facts (title, author, year) that are not themselves protectable expression. We may forward the substance of notices to the affected account holder where relevant. Repeat infringement by a contributor results in permanent removal of access.",
        ],
      },
      {
        heading: "4. Corrections and Counter-Notice",
        paragraphs: [
          "If content was removed and you believe this was mistaken, reply explaining why; we review counter-notices on the same timeline. For factual corrections to any summary, email " + OPERATOR.email + " — corrections are part of the editorial standard, not an exception to it.",
        ],
      },
      { ...CONTACT_SECTION },
    ],
  },
  {
    slug: "disclaimer",
    title: "Investment Disclaimer",
    kicker: "EDITORIAL",
    description:
      "Investor/Pass is historical reference, not investment advice. Read this before making any decision influenced by the library.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        heading: "1. Not Investment Advice",
        paragraphs: [
          "Nothing in Investor/Pass is investment advice, a recommendation, an offer, or a solicitation to buy or sell any security or asset. The Service documents what investors historically thought, said, and did. It does not tell you what to do, and past statements or actions by any investor are not predictions about markets or securities.",
        ],
      },
      {
        heading: "2. Educational and Historical Reference Only",
        paragraphs: [
          "Records are paraphrased contextual summaries of historical communications, indexed for study. Coverage indicators (reference counts, matrices, timelines) measure how much verified material exists in the library — they say nothing about the quality of any investment idea, company, or person.",
        ],
      },
      {
        heading: "3. Accuracy and Paraphrase Caveats",
        paragraphs: [
          "Summaries are secondary representations of primary sources and may contain errors, omissions, or interpretive choices. Where precision matters, open the linked original source and read it directly. Outcomes attached to decisions are labeled KNOWN, PARTIAL, or UNKNOWN precisely because history is often incomplete — treat unknown outcomes as unknown.",
        ],
      },
      {
        heading: "4. No Warranty; Do Your Own Research",
        paragraphs: [
          "Markets involve risk, including total loss. Always conduct independent due diligence and consult licensed professionals where appropriate. We accept no liability for financial decisions made in reliance on the Service.",
        ],
      },
      {
        heading: "5. Corrections",
        paragraphs: [
          "Spotted an error in a summary, attribution, or outcome? Email " + OPERATOR.email + ". Corrections are applied editorially and logged in the record's history.",
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refund & Cancellation Policy",
    kicker: "LEGAL",
    description:
      "How to cancel Investor/Pass, what happens to your access, and exactly when refunds are issued.",
    updated: LEGAL_UPDATED,
    sections: [
      {
        heading: "1. Cancellation",
        paragraphs: [
          "Cancel anytime from your account settings, or by emailing " + OPERATOR.email + ". Cancellation stops all future renewals immediately; your Pro access continues through the end of the period already paid, then reverts to Free. Deleting your account cancels the subscription as well.",
        ],
      },
      {
        heading: "2. Monthly Plans",
        paragraphs: [
          "Monthly subscriptions (US$9 or regional equivalent) are generally non-refundable once a billing cycle has started, since full access is delivered during the cycle. Exceptions: duplicate charges, technical faults that denied access, or charges after effective cancellation — refunded in full.",
        ],
      },
      {
        heading: "3. Annual Plans",
        paragraphs: [
          "Annual subscriptions (US$79 or regional equivalent) may be refunded pro-rata within 14 days of the initial charge if you have made limited use of Pro features. After 14 days, refunds are considered case-by-case for genuine issues (renewal after intended cancellation, loss of access we could not fix). Renewal charges can be refunded in full within 7 days if no significant Pro usage occurred post-renewal.",
        ],
      },
      {
        heading: "4. How Refunds Are Issued",
        paragraphs: [
          "Approved refunds are returned to the original payment method via the processor that handled the charge (Razorpay or PayPal). Allow 5–10 business days for the credit to appear, depending on the processor and your bank. Taxes collected are refunded proportionally where required.",
        ],
      },
      {
        heading: "5. Statutory Rights",
        paragraphs: [
          "This policy applies in addition to any non-waivable consumer rights in your jurisdiction. Where local law provides stronger remedies (for example EU/UK distance-selling rules or Indian consumer law), those rights prevail.",
        ],
      },
      { ...CONTACT_SECTION },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}

export const LEGAL_SLUGS = LEGAL_DOCS.map((d) => d.slug);
