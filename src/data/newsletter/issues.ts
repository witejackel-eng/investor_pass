/**
 * Newsletter issues — static, typed (Master Plan Phase 19).
 *
 * The founder's public notes. Author voice per the constitution: curious,
 * research-oriented, personal, calm. No guru claims, no fabricated
 * credentials, no invented evidence — anything referencing the library
 * points at real indexed entities and real counts.
 *
 * Issue #1 is the launch note. Issues ship only when ready — quality over
 * cadence (constitution: never publish filler to hit a schedule).
 */

export type NewsletterIssue = {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  publishedAt: string;
  /** Sectioned body, rendered as editorial prose. */
  body: { heading: string; paragraphs: string[] }[];
  /** Real canonical links into the library. */
  related: { label: string; href: string }[];
  /** Subscriber-only deeper edition exists for this issue. */
  subscriberEdition: boolean;
};

export const FOUNDER = {
  name: "Aditya",
  positioning:
    "I'm Aditya. I love investing, finance, and understanding how capital actually moves through the world. I'm building Investor/Pass to make that world easier to understand and easier to research.",
};

export const ISSUES: NewsletterIssue[] = [
  {
    slug: "why-i-am-indexing-the-public-record",
    number: 1,
    title: "Why I'm indexing the public record",
    subtitle: "The first note: what I'm building, and the question behind it.",
    publishedAt: "2026-02-12",
    body: [
      {
        heading: "The question",
        paragraphs: [
          "I'm Aditya. I love investing, finance, and understanding how capital actually moves through the world. I'm building Investor/Pass to make that world easier to understand and easier to research.",
          "The problem I kept hitting is simple: the best material in investing is public, and almost impossible to use. Berkshire's letters are free — spread over fifty years of PDFs. Howard Marks' memos are free — unsearchable across three decades. Great interviews sit in forgotten corners of the internet. The record exists; the index doesn't.",
        ],
      },
      {
        heading: "What I built first",
        paragraphs: [
          "Investor/Pass now indexes 31 investors — 619 sources, 12,078 paraphrased research units, every one traceable to a publisher and a date. Not quotes scraped and dumped: paraphrased units with provenance, organized by theme, company, and event, so you can ask a question and see who in the record addresses it.",
          "The part I care most about is what I call the wedge: search one idea and see who talks about it. Ask about risk and you find 105 indexed units under Howard Marks, 16 under Buffett — not because I decided Marks cares more about risk, but because the record says so. The evidence leads; the product follows.",
        ],
      },
      {
        heading: "What this newsletter will be",
        paragraphs: [
          "Every note will be the same deal: something I actually researched, connected to the indexed record so you can check it. How hedge funds actually work. What Einhorn's Lehman thesis really argued. What five different investors were reading in 2008. When I get something wrong, the correction goes in the record — there's a changelog.",
          "If that sounds useful, subscribe. It's free, and it's how you'll hear when new investors enter the library.",
        ],
      },
    ],
    related: [
      { label: "Start with how hedge funds work", href: "/learn/how-hedge-funds-work" },
      { label: "Who talks about risk?", href: "/#/view=compare" },
      { label: "The 2008 trail", href: "/trails/2008-through-five-investors" },
    ],
    subscriberEdition: true,
  },
];

export const issueBySlug = (slug: string) => ISSUES.find((i) => i.slug === slug);
export const latestIssue = () => ISSUES[ISSUES.length - 1];
