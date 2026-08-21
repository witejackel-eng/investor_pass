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
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
