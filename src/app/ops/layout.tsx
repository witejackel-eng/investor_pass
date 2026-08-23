import type { Metadata } from "next";
import "./ops.css";

// Root ops layout: chrome-less shell. Dashboard chrome lives in (dash)/layout.
export const metadata: Metadata = {
  title: "Investor/Pass Control Room",
  robots: { index: false, follow: false },
};

export default function OpsRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="ops-root ops-body min-h-screen">{children}</div>;
}
