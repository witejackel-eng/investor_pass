"use client";
/**
 * First-time user onboarding (4-step modal).
 * Appears only on the very first visit of an anonymous user.
 * Never appears again after the user signs up, logs in, or dismisses it.
 *
 * Storage:
 *   - Anonymous: localStorage "ip_onboarding_seen" = "true"
 *   - Logged-in: handled by the store (user.onboardingSeen flag — if added later)
 *
 * Per spec: 4 steps — Welcome, How it works, Research tools, Final.
 * × close + Skip link + primary Next button. Progress indicator.
 * Never show on /legal pages.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/stores/app-store";
import { Scale, GitCompare, Route, ArrowRight, X } from "lucide-react";

const STORAGE_KEY = "ip_onboarding_seen";
const STEPS = 4;

export function OnboardingModal() {
  const go = useStore((s) => s.go);
  const user = useStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't show on legal pages
    if (window.location.pathname.startsWith("/legal")) return;
    // Don't show if already seen
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen === "true") return;
    } catch {
      return;
    }
    // Don't show for logged-in users (they've been through it or are past it)
    if (user) {
      try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
      return;
    }
    // Small delay so it doesn't jolt on page load
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [user]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  const skipToSignup = () => {
    dismiss();
    go("signup");
  };

  const skipToExplore = () => {
    dismiss();
    go("home");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="relative w-full max-w-lg border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_0_var(--ink)] sm:p-8">
        <button onClick={dismiss} className="absolute right-3 top-3 text-graphite hover:text-ink" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-signal-dark" : i < step ? "w-3 bg-ink" : "w-3 bg-rule"}`}
            />
          ))}
          <span className="ml-auto font-mono text-[0.55rem] uppercase tracking-wider text-graphite">
            Step {step + 1} of {STEPS}
          </span>
        </div>

        {/* Step content */}
        {step === 0 && (
          <div className="mt-6">
            <h2 id="onboarding-title" className="font-display text-3xl font-bold leading-tight tracking-tight">
              Welcome to Investor/Pass
            </h2>
            <p className="mt-3 font-reader text-base text-graphite">
              The public record of exceptional investors and founders — searchable, structured, and connected. Every passage is paraphrased with source attribution.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="mt-6">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">Three ways to explore</h2>
            <ul className="mt-4 space-y-3 font-reader text-sm text-graphite">
              <li className="flex gap-2">
                <span className="text-signal-dark">·</span>
                <span><strong className="text-ink">Search</strong> anything across investors, founders, filings, and books.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-signal-dark">·</span>
                <span><strong className="text-ink">Browse</strong> by People, Themes, or Companies from the Discover hub.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-signal-dark">·</span>
                <span><strong className="text-ink">Follow</strong> ideas and continue where you left off.</span>
              </li>
            </ul>
          </div>
        )}
        {step === 2 && (
          <div className="mt-6">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">Go deeper</h2>
            <div className="mt-4 grid gap-3">
              <div className="border border-rule p-3 flex items-center gap-3">
                <Scale className="h-5 w-5 text-signal-dark" />
                <div>
                  <p className="font-display text-sm font-bold">Decision Ledger</p>
                  <p className="font-reader text-xs text-graphite">What was said, what was done, what happened next.</p>
                </div>
              </div>
              <div className="border border-rule p-3 flex items-center gap-3">
                <GitCompare className="h-5 w-5 text-signal-dark" />
                <div>
                  <p className="font-display text-sm font-bold">Compare</p>
                  <p className="font-reader text-xs text-graphite">Side-by-side investor analysis.</p>
                </div>
              </div>
              <div className="border border-rule p-3 flex items-center gap-3">
                <Route className="h-5 w-5 text-signal-dark" />
                <div>
                  <p className="font-display text-sm font-bold">Trails</p>
                  <p className="font-reader text-xs text-graphite">Curated reading paths across the library.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="mt-6">
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">Ready when you are</h2>
            <p className="mt-3 font-reader text-base text-graphite">
              Create a free account to save your research — bookmarks, collections, followed investors, and reading continuity. Or start exploring right away.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button onClick={dismiss} className="font-mono text-xs uppercase tracking-wider text-graphite hover:text-ink">
            Skip
          </button>
          {step < STEPS - 1 ? (
            <button onClick={next} className="bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors">
              Next <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={skipToExplore} className="border border-ink px-4 py-2 text-sm font-semibold hover:bg-paper-2 transition-colors">
                Start exploring
              </button>
              <button onClick={skipToSignup} className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors">
                Create free account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
