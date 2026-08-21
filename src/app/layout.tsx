import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Investor/Pass — The public record, properly indexed",
  description:
    "Investor/Pass is a premium information-access product built around the public record of exceptional investors. Launch collection: Warren Buffett. Searchable, structured, connected, and exceptionally easy to explore.",
  keywords: [
    "Warren Buffett",
    "Berkshire Hathaway",
    "investor research",
    "shareholder letters",
    "value investing",
    "capital allocation",
    "economic moats",
    "Investor Pass",
  ],
  authors: [{ name: "Investor/Pass" }],
  openGraph: {
    title: "Investor/Pass — The public record, properly indexed",
    description:
      "Premium information-access product around the public record of exceptional investors. Launch collection: Warren Buffett.",
    type: "website",
    siteName: "Investor/Pass",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investor/Pass",
    description: "The public record, properly indexed.",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
  },
};

// JSON-LD structured data for SEO (master prompt §30)
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Investor/Pass",
  description:
    "Premium information-access product built around the public record of exceptional investors.",
  url: "https://investor-pass.vercel.app",
  knowsAbout: [
    "Warren Buffett",
    "Berkshire Hathaway",
    "value investing",
    "capital allocation",
    "economic moats",
    "shareholder letters",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Investor/Pass",
  url: "https://investor-pass.vercel.app",
  description: "The public record, properly indexed.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://investor-pass.vercel.app/#/view=search&q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
