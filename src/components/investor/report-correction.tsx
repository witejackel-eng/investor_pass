"use client";
/**
 * Report a correction (Master Plan §35) — collapsible form that posts to
 * /api/corrections. Placed on passage and source surfaces.
 */
import { useState } from "react";
import { apiPost } from "@/lib/client";
import { Flag, Check, ChevronDown } from "lucide-react";

export function ReportCorrection({
  entityKind,
  entityId,
  entityLabel,
}: {
  entityKind: "passage" | "source" | "decision" | "company" | "theme" | "event";
  entityId: string;
  entityLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState("factual");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async () => {
    setState("sending");
    setErrorMsg("");
    try {
      const res = await apiPost<{ ok?: boolean; error?: string }>("/api/corrections", {
        entityKind,
        entityId,
        issueType,
        message,
        email: email || undefined,
      });
      if (res.ok) {
        setState("done");
      } else {
        setErrorMsg(res.error || "Could not submit.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error — please try again.");
      setState("error");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-graphite hover:text-signal-dark"
        aria-label="Report a correction"
      >
        <Flag className="h-3 w-3" /> Report a correction
      </button>
    );
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 border border-signal-dark bg-signal-ghost px-3 py-2">
        <Check className="h-3.5 w-3.5 text-signal-dark" />
        <p className="font-mono text-[0.65rem] uppercase tracking-wider text-signal-dark">
          Received — every report is reviewed by an editor
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule bg-paper-2 p-3">
      <div className="flex items-center justify-between">
        <p className="kicker flex items-center gap-1.5">
          <Flag className="h-3 w-3" /> REPORT A CORRECTION
          {entityLabel ? <span className="text-graphite">· {entityLabel}</span> : null}
        </p>
        <button onClick={() => setOpen(false)} className="text-graphite hover:text-ink" aria-label="Close">
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="w-full border border-rule bg-paper px-2 py-1.5 font-mono text-xs"
          aria-label="Issue type"
        >
          <option value="factual">Factual error</option>
          <option value="sourcing">Source or attribution problem</option>
          <option value="tagging">Wrong theme/company/event tag</option>
          <option value="duplicate">Duplicate entity</option>
          <option value="other">Something else</option>
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What should be corrected, and what's the evidence? (links welcome)"
          rows={3}
          maxLength={2000}
          className="w-full border border-rule bg-paper px-2 py-1.5 font-reader text-sm"
          aria-label="Correction description"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional — only used to follow up)"
          type="email"
          className="w-full border border-rule bg-paper px-2 py-1.5 font-reader text-sm"
          aria-label="Optional contact email"
        />
        {state === "error" && (
          <p className="font-mono text-xs text-red-700">{errorMsg}</p>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={submit}
            disabled={state === "sending" || message.trim().length < 10}
            className="bg-ink px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-paper hover:bg-signal-dark disabled:opacity-40"
          >
            {state === "sending" ? "SENDING…" : "SUBMIT REPORT"}
          </button>
          <span className="font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
            Reviewed by an editor before any change
          </span>
        </div>
      </div>
    </div>
  );
}
