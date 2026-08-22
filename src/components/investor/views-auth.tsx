"use client";
import { useState, useEffect } from "react";
import { useStore, type ViewParams } from "@/stores/app-store";
import { apiPost } from "@/lib/client";
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
