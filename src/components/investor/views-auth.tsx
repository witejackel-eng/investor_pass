"use client";
import { useState, useEffect, useCallback } from "react";
import { useStore, type ViewParams } from "@/stores/app-store";
import { apiPost, apiGet } from "@/lib/client";
import { PRICING, useCurrency } from "@/lib/pricing";
import { toast } from "sonner";
import { Loading } from "./views-core";
import { Crown, Check, Shield } from "lucide-react";

// ── Google sign-in ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.1 14.3c-.3-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.8-2.9z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C16.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.8 2.9c1-3 3.7-5 6.9-5z" />
    </svg>
  );
}

function GoogleButton({ label }: { label: string }) {
  return (
    <a href="/api/auth/google" className="flex w-full items-center justify-center gap-2 border border-ink bg-paper py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-2">
      <GoogleIcon />
      {label}
    </a>
  );
}

function OrDivider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <span className="h-px flex-1 bg-rule" />
      <span className="kicker text-graphite">OR</span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────
export function LoginView() {
  const { login, go } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("error=google")) {
      toast.error("Google sign-in failed. Please try again.");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      go("library");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ LOG IN</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Welcome back</h1>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        <button disabled={loading} className="w-full bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark disabled:opacity-50">
          {loading ? "LOGGING IN…" : "LOG IN"}
        </button>
      </form>
      <OrDivider />
      <GoogleButton label="CONTINUE WITH GOOGLE" />
      <p className="mt-4 text-center font-reader text-sm text-graphite">
        No account? <button onClick={() => go("signup")} className="font-semibold text-signal-dark hover:underline">Sign up</button>
      </p>
      <p className="mt-2 text-center font-reader text-sm text-graphite">
        <button onClick={() => go("forgot")} className="hover:underline">Forgot your password?</button>
      </p>
    </div>
  );
}

// ── Forgot password ────────────────────────────────────────────────────────
export function ForgotView() {
  const { go } = useStore();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetPath, setResetPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      // The server answers the same whether or not the account exists —
      // no enumeration. In prelaunch it may hand back the link directly.
      setSent(true);
      if (json?.resetPath) setResetPath(json.resetPath as string);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ RESET PASSWORD</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Reset your password</h1>
        {!sent ? (
          <p className="mt-2 font-reader text-graphite">
            Enter the email on your account and we&apos;ll send a reset link.
          </p>
        ) : null}
      </div>
      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="font-reader text-graphite">
            If an account exists for that email, a reset link is on its way. It expires in 60 minutes.
          </p>
          {resetPath ? (
            <div className="border border-rule bg-paper p-3">
              <p className="kicker text-graphite">PRELAUNCH — EMAIL NOT WIRED YET</p>
              <a href={`#${resetPath}`} className="font-reader text-sm text-signal-dark underline underline-offset-2">
                Open reset link now →
              </a>
            </div>
          ) : null}
          <button onClick={() => go("login")} className="text-sm font-semibold text-signal-dark hover:underline">
            ← BACK TO LOG IN
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <button disabled={loading} className="w-full bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark disabled:opacity-50">
            {loading ? "SENDING…" : "SEND RESET LINK"}
          </button>
          <p className="text-center font-reader text-sm text-graphite">
            <button type="button" onClick={() => go("login")} className="hover:underline">Back to log in</button>
          </p>
        </form>
      )}
    </div>
  );
}

// ── Reset password (token from email/prelaunch link) ───────────────────────
export function ResetView({ token }: { token: string }) {
  const { go } = useStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Reset failed");
      setDone(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ RESET PASSWORD</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Choose a new password</h1>
      </div>
      {done ? (
        <div className="mt-6 space-y-4">
          <p className="font-reader text-graphite">
            Password updated. All other sessions were signed out for safety.
          </p>
          <button
            onClick={() => go("login")}
            className="w-full bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark"
          >
            LOG IN WITH NEW PASSWORD
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="New password (min 8 chars)" type="password" value={password} onChange={setPassword} required />
          <Field label="Confirm new password" type="password" value={confirm} onChange={setConfirm} required />
          <button disabled={loading} className="w-full bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark disabled:opacity-50">
            {loading ? "SAVING…" : "SET PASSWORD"}
          </button>
          <p className="text-center font-reader text-sm text-graphite">
            <button type="button" onClick={() => go("forgot")} className="hover:underline">Request a new link</button>
          </p>
        </form>
      )}
    </div>
  );
}

// ── Signup ─────────────────────────────────────────────────────────────────
export function SignupView() {
  const { signup, go } = useStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Account created — you're on Free");
      go("home");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[440px] px-4 py-16">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ SIGN UP</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 font-reader text-graphite">Start free. Upgrade to Pro anytime — $19/month or ₹999/month.</p>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Name (optional)" type="text" value={name} onChange={setName} />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password (min 8 chars)" type="password" value={password} onChange={setPassword} required />
        <button disabled={loading} className="w-full bg-ink py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark disabled:opacity-50">
          {loading ? "CREATING…" : "CREATE ACCOUNT"}
        </button>
      </form>
      <OrDivider />
      <GoogleButton label="SIGN UP WITH GOOGLE" />
      <p className="mt-4 text-center font-reader text-sm text-graphite">
        Already have an account? <button onClick={() => go("login")} className="font-semibold text-signal-dark hover:underline">Log in</button>
      </p>
    </div>
  );
}

// ── Upgrade ────────────────────────────────────────────────────────────────
export function UpgradeView() {
  const { upgrade, go, user } = useStore();
  const params = useStore((s) => s.params);
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState<"monthly" | "annual">("annual");
  const [currency, setCurrency] = useCurrency();
  const p = PRICING[currency];

  // Pros don't see pricing — they see plan management (respect who paid).
  if (user?.entitlement === "pro") {
    return (
      <div className="mx-auto max-w-[680px] px-4 py-16">
        <div className="border-t-2 border-ink pt-4 text-center">
          <p className="kicker text-signal-dark">/ INVESTOR/PASS PRO</p>
          <h1 className="mt-3 flex items-center justify-center gap-2 font-display text-4xl font-semibold tracking-tight">
            <Crown className="h-7 w-7 text-signal-dark" /> You're on Pro
          </h1>
          <p className="mt-2 font-reader text-graphite">Full access to every passage, source, and connection. Manage your plan anytime from Account.</p>
          <button onClick={() => go("account")} className="mt-6 bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-signal-dark">OPEN ACCOUNT</button>
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (!user) { go("signup"); return; }
    setLoading(true);
    try {
      await upgrade(variant);
      toast.success("You're now Pro — full library unlocked");
      // Return to the exact research state that led here (spec §28)
      const ctx: ViewParams = {};
      if (params.q) ctx.q = params.q;
      for (const k of ["person", "theme", "company", "concept", "event", "yearFrom", "yearTo", "sourceType", "decade"]) {
        const v = params[k];
        if (v) ctx[k] = v;
      }
      go("search", ctx);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[860px] px-4 py-12">
      <div className="border-t-2 border-ink pt-4 text-center">
        <p className="kicker text-signal-dark">/ UNLOCK INVESTOR/PASS PRO</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
          Search everything.<br />Explore every connection.<br />Save your research.
        </h1>
        <p className="mt-4 font-reader text-lg text-graphite">Access the full investor library — every passage, every source, every link between theme, company, year, and decision.</p>
      </div>

      {/* Currency selector — region-defaulted, always switchable (payments spec §1) */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <span className="kicker mr-1">CURRENCY</span>
        {(["INR", "USD"] as const).map((c) => (
          <button key={c} onClick={() => setCurrency(c)} className={currency === c ? "chip chip-signal" : "chip"}>
            {c === "INR" ? "₹ INR" : "$ USD"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <button onClick={() => setVariant("monthly")} className={`border p-6 text-left transition-all ${variant === "monthly" ? "border-ink bg-paper shadow-[3px_3px_0_0_var(--ink)]" : "border-rule bg-paper-2"}`}>
          <p className="kicker">MONTHLY</p>
          <p className="mt-2 font-display text-4xl font-bold">{p.monthly}<span className="text-base font-normal text-graphite">/mo</span></p>
          <ul className="mt-4 space-y-1.5 font-reader text-sm text-graphite">
            <li>· Full search</li>
            <li>· All passages</li>
            <li>· Bookmarks</li>
          </ul>
        </button>
        <button onClick={() => setVariant("annual")} className={`border-2 p-6 text-left transition-all ${variant === "annual" ? "border-ink bg-paper shadow-[4px_4px_0_0_var(--ink)]" : "border-rule bg-paper-2"}`}>
          <div className="flex items-center justify-between">
            <p className="kicker text-signal-dark">ANNUAL</p>
            <span className="chip chip-signal">≈ 8 MONTHS</span>
          </div>
          <p className="mt-2 font-display text-4xl font-bold">{p.annual}<span className="text-base font-normal text-graphite">/yr</span></p>
          <p className="font-mono text-xs text-graphite">{currency === "INR" ? "₹7,999 ≈ 8 × ₹999" : "$149 < 8 × $19"}</p>
          <ul className="mt-4 space-y-1.5 font-reader text-sm text-graphite">
            <li>· Everything in monthly</li>
            <li>· Saved searches</li>
            <li>· Collections</li>
          </ul>
        </button>
      </div>

      <button onClick={submit} disabled={loading} className="mt-6 w-full bg-ink py-3 text-sm font-semibold text-paper hover:bg-signal-dark disabled:opacity-50">
        {loading ? "PROCESSING…" : user ? `START PRO — ${variant === "annual" ? `${p.annual}/YEAR` : `${p.monthly}/MONTH`}` : "SIGN UP TO CONTINUE"}
      </button>
      <p className="mt-3 text-center font-reader text-xs text-graphite">
        Simulated checkout for demonstration. In production this routes through Razorpay or PayPal with webhook-verified entitlement.
      </p>
    </div>
  );
}

// ── Account ────────────────────────────────────────────────────────────────
export function AccountView() {
  const { user, logout, go } = useStore();
  if (!user) return <div className="mx-auto max-w-[440px] px-4 py-16"><button onClick={() => go("login")} className="bg-ink px-5 py-2 text-sm font-semibold text-paper">LOG IN</button></div>;

  return (
    <div className="mx-auto max-w-[680px] px-4 py-12">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ ACCOUNT</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{user.name || user.email.split("@")[0]}</h1>
        <p className="mt-1 font-mono text-sm text-graphite">{user.email}</p>
      </div>

      <div className="mt-6 border border-ink p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="kicker">CURRENT PLAN</p>
            <p className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">
              {user.entitlement === "pro" ? (
                <span className="flex items-center gap-2 text-signal-dark"><Crown className="h-5 w-5" /> PRO</span>
              ) : "FREE"}
            </p>
          </div>
          {user.entitlement !== "pro" && (
            <button onClick={() => go("upgrade")} className="bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">UPGRADE</button>
          )}
        </div>
        {user.entitlement === "pro" && (
          <p className="mt-3 font-reader text-sm text-graphite">
            You have full access to every passage, source, and connection. Bookmarks, saved searches, and collections are available in the Library.
          </p>
        )}
      </div>

      {user.role === "admin" && (
        <div className="mt-4 border border-rule p-4">
          <p className="kicker flex items-center gap-1"><Shield className="h-3 w-3" /> ADMIN ACCESS</p>
          <button onClick={() => go("admin")} className="mt-2 chip chip-ink">OPEN ADMIN / IMPORT</button>
        </div>
      )}

      <button onClick={logout} className="mt-6 chip">LOG OUT</button>
    </div>
  );
}

// ── Admin analytics ─────────────────────────────────────────────────────────
type Analytics = {
  totals: { name: string; count: number }[];
  topQueries: { query: string; count: number }[];
  zeroResults: { total: number; measured: number; zero: number; rate: number | null };
  dailySearches: { date: string; count: number }[];
  clientErrors: { createdAt: string; message: string; stack?: string; url?: string }[];
};

export function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      setData(await apiGet<Analytics>("/api/admin/analytics"));
    } catch (e: any) {
      setErr(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="mt-10">
      <div className="border-t-2 border-ink pt-4">
        <div className="flex items-center justify-between">
          <p className="kicker">/ ADMIN — ANALYTICS</p>
          <button onClick={() => void load()} disabled={loading} className="chip disabled:opacity-50">
            {loading ? "REFRESHING…" : "REFRESH"}
          </button>
        </div>
      </div>

      {err && <p className="mt-3 font-reader text-sm text-signal-dark">{err}</p>}

      {!data && !err && loading && <p className="mt-3 font-reader text-sm text-graphite">Loading analytics…</p>}

      {data && (
        <div className="mt-4 space-y-8">
          {/* Event totals */}
          <div>
            <p className="kicker mb-2">EVENT TOTALS · LAST 30 DAYS</p>
            {data.totals.length === 0 ? (
              <p className="font-reader text-sm text-graphite">No events recorded yet.</p>
            ) : (
              <table className="w-full max-w-[560px] border border-rule font-mono text-xs">
                <tbody>
                  {data.totals.map((t) => (
                    <tr key={t.name} className="border-b border-rule last:border-b-0">
                      <td className="px-3 py-1.5">{t.name}</td>
                      <td className="px-3 py-1.5 text-right font-semibold">{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Top queries */}
          <div>
            <p className="kicker mb-2">TOP SEARCH QUERIES · LAST 30 DAYS</p>
            {data.topQueries.length === 0 ? (
              <p className="font-reader text-sm text-graphite">No search queries recorded yet.</p>
            ) : (
              <table className="w-full max-w-[560px] border border-rule font-mono text-xs">
                <tbody>
                  {data.topQueries.map((q) => (
                    <tr key={q.query} className="border-b border-rule last:border-b-0">
                      <td className="px-3 py-1.5">{q.query}</td>
                      <td className="px-3 py-1.5 text-right font-semibold">{q.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Zero-result rate + daily searches */}
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="kicker mb-2">ZERO-RESULT RATE</p>
              {data.zeroResults.rate === null ? (
                <p className="font-reader text-sm text-graphite">
                  No result-count data yet — searches aren&apos;t recording a results field.
                </p>
              ) : (
                <p className="font-mono text-sm">
                  <span className="font-display text-3xl font-bold">{(data.zeroResults.rate * 100).toFixed(1)}%</span>
                  <span className="ml-2 text-graphite">
                    ({data.zeroResults.zero} of {data.zeroResults.measured} measured / {data.zeroResults.total} searches)
                  </span>
                </p>
              )}
            </div>
            <div>
              <p className="kicker mb-2">DAILY SEARCHES · LAST 14 DAYS</p>
              {data.dailySearches.every((d) => d.count === 0) ? (
                <p className="font-reader text-sm text-graphite">No searches in the last 14 days.</p>
              ) : (
                <ul className="max-w-[280px] space-y-0.5 font-mono text-xs">
                  {data.dailySearches.map((d) => (
                    <li key={d.date} className="flex justify-between gap-6">
                      <span className="text-graphite">{d.date}</span>
                      <span className="font-semibold">{d.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent client errors */}
          <div>
            <p className="kicker mb-2">RECENT CLIENT ERRORS · LAST 25</p>
            {data.clientErrors.length === 0 ? (
              <p className="font-reader text-sm text-graphite">No client errors reported — all clear.</p>
            ) : (
              <ul className="max-w-[760px] divide-y divide-rule border border-rule font-mono text-xs">
                {data.clientErrors.map((e, i) => (
                  <li key={`${e.createdAt}-${i}`} className="px-3 py-2">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-graphite">{e.createdAt.replace("T", " ").slice(0, 19)}</span>
                      <span className="font-semibold break-all">{e.message.slice(0, 200)}</span>
                    </div>
                    {e.url && <p className="mt-0.5 break-all text-graphite">{e.url}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Admin import ───────────────────────────────────────────────────────────
export function AdminView() {
  const { user, go } = useStore();
  const [json, setJson] = useState(`{
  "person": "buffett",
  "source": {
    "title": "Example import",
    "year": 2015,
    "type": "shareholder_letter",
    "publisher": "Berkshire Hathaway Inc.",
    "url": "https://www.berkshirehathaway.com/letters/2015.html"
  },
  "passages": [
    {
      "text": "Paraphrased contextual summary…",
      "themes": ["capital-allocation"],
      "concepts": ["intrinsic-value"],
      "companies": ["berkshire-hathaway"]
    }
  ]
}`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!user) return <div className="mx-auto max-w-[440px] px-4 py-16"><button onClick={() => go("login")} className="bg-ink px-5 py-2 text-sm font-semibold text-paper">LOG IN</button></div>;
  if (user.role !== "admin") return <div className="mx-auto max-w-[440px] px-4 py-16"><p className="font-reader text-graphite">Admin access required.</p></div>;

  const submit = async () => {
    setLoading(true);
    try {
      const body = JSON.parse(json);
      const r = await apiPost("/api/admin/import", body);
      setResult(r);
      toast.success("Imported");
    } catch (e: any) {
      toast.error(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-[860px] px-4 py-12">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ ADMIN — IMPORT</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Structured import</h1>
        <p className="mt-2 font-reader text-graphite">Paste a JSON document in the import format (see master prompt §25). Records enter as <span className="font-mono">provenance_status: imported</span>.</p>
      </div>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} className="mt-4 h-80 w-full border border-ink bg-paper-2 p-3 font-mono text-xs scroll-thin" spellCheck={false} />
      <button onClick={submit} disabled={loading} className="mt-3 bg-ink px-5 py-2 text-sm font-semibold text-paper hover:bg-signal-dark disabled:opacity-50">
        {loading ? "IMPORTING…" : "IMPORT"}
      </button>
      {result && (
        <div className="mt-4 border border-rule p-3 font-mono text-xs">
          <p className="kicker">RESULT</p>
          <pre className="mt-2 overflow-auto scroll-thin">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <AdminAnalytics />
    </div>
  );
}

function Field({ label, type, value, onChange, required }: { label: string; type: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="kicker">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="mt-1 w-full border border-ink bg-paper px-3 py-2 font-reader text-base outline-none focus:border-signal" />
    </label>
  );
}
