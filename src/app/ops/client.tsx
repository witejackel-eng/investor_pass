"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="ops-btn-ghost"
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/ops/logout", { method: "POST" });
          router.push("/ops/login");
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "…" : "LOCK"}
    </button>
  );
}

export function OpsLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  return (
    <form
      className="mt-6 flex flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          const r = await fetch("/api/ops/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pw }),
          });
          if (r.ok) {
            router.push("/ops");
            router.refresh();
          } else {
            const d = (await r.json().catch(() => ({}))) as { error?: string };
            setErr(d.error ?? "Access denied");
            setPw("");
          }
        } catch {
          setErr("Network error");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="ops-password" className="ops-kicker">
        ENTER ACCESS PASSWORD
      </label>
      <input
        id="ops-password"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        className="border border-[var(--ops-ink)] bg-[var(--ops-card)] px-3 py-2.5 text-lg tracking-[0.4em] outline-none"
        placeholder="••••••••"
      />
      {err && <p className="ops-fail text-xs">{err}</p>}
      <button type="submit" className="ops-btn w-fit" disabled={busy}>
        {busy ? "VERIFYING…" : "ACCESS CONTROL ROOM"}
      </button>
    </form>
  );
}
