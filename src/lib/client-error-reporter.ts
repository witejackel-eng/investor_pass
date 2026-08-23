"use client";

/**
 * Client-side error reporter — in-house Sentry equivalent.
 *
 * Captures window "error" and "unhandledrejection" events, scrubs obvious PII
 * (emails, long tokens), and POSTs each report to /api/errors (which stores it
 * as a SearchEvent with name="client_error"). Hard guarantees:
 *  - never throws (every path is guarded)
 *  - no-ops while offline (navigator.onLine === false)
 *  - max 10 posts per page-load
 */

const MAX_REPORTS_PER_LOAD = 10;

let installed = false;
let sent = 0;

/** Replace emails and long token-like strings before anything leaves the page. */
function scrub(input: string): string {
  return input
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    .replace(/\b[A-Za-z0-9_-]{20,}\b/g, "[token]");
}

function report(payload: {
  message: string;
  stack?: string;
  url?: string;
}): void {
  try {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    if (sent >= MAX_REPORTS_PER_LOAD) return;
    sent++;
    const body = JSON.stringify({
      message: scrub(String(payload.message)).slice(0, 500),
      stack: payload.stack ? scrub(payload.stack).slice(0, 4000) : undefined,
      url: typeof window !== "undefined" ? window.location.href : payload.url,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // reporting must never break the app
  }
}

function onError(e: ErrorEvent): void {
  try {
    report({
      message:
        (e.message || "Unknown error") +
        `${e.filename ? ` (${e.filename}${e.lineno ? `:${e.lineno}` : ""})` : ""}`,
      stack: e.error?.stack,
    });
  } catch {}
}

function onUnhandledRejection(e: PromiseRejectionEvent): void {
  try {
    const reason = e?.reason;
    if (reason instanceof Error) {
      report({ message: `Unhandled rejection: ${reason.message}`, stack: reason.stack });
    } else {
      let text = "";
      try { text = String(reason); } catch { text = "[unserializable reason]"; }
      report({ message: `Unhandled rejection: ${text}` });
    }
  } catch {}
}

export function installClientErrorReporting(): void {
  try {
    if (installed || typeof window === "undefined") return;
    installed = true;
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
  } catch {
    // never throw from install
  }
}
