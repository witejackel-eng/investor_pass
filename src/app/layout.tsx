import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/app/providers";
import { SITE_URL } from "@/lib/site";

// Self-hosted via next/font — zero render-blocking requests, zero CLS.
const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["opsz"],
});

const readerFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
  axes: ["opsz"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2efe7" },
    { media: "(prefers-color-scheme: dark)", color: "#11110f" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Investor/Pass — The public record, properly indexed",
    description:
      "Premium information-access product around the public record of exceptional investors. Launch collection: Warren Buffett.",
    type: "website",
    siteName: "Investor/Pass",
    url: SITE_URL,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Investor/Pass — The public record, properly indexed" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Investor/Pass",
    description: "The public record, properly indexed.",
    images: ["/og.png"],
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
  url: SITE_URL,
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
  url: SITE_URL,
  description: "The public record, properly indexed.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/#/view=search&q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${displayFont.variable} ${readerFont.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
