"use client";
import { AppRoot } from "@/components/investor/app-root";

// The SPA application shell (hash-routed views). Real-path entries that
// render the same shell live at /search and /compare.
export default function Home() {
  return <AppRoot />;
}
