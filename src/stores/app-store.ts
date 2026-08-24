/**
 * Investor/Pass — SPA view-state store.
 *
 * Because only `/` is user-visible, the product is delivered as a single-page
 * application with a Zustand view-state router. Views are addressable by
 * `view` + `params` and the browser history is updated with the hash so deep
 * links and back/forward work.
 */
import { create } from "zustand";
import { apiGet, apiPost, apiDelete, track } from "@/lib/client";

export type View =
  | "home"
  | "investors"
  | "investor"
  | "timeline"
  | "topic"
  | "company"
  | "year"
  | "source"
  | "passage"
  | "concept"
  | "event"
  | "search"
  | "trails"
  | "learn"
  | "graph"
  | "trailDetail"
  | "compare"
  | "library"
  | "bookmarks"
  | "searches"
  | "collections"
  | "watchlist"
  | "account"
  | "upgrade"
  | "login"
  | "signup"
  | "forgot"
  | "reset"
  | "admin";

export type ViewParams = Record<string, string | undefined>;

type User = {
  id: string;
  email: string;
  name: string | null;
  entitlement: "free" | "pro";
  role: "user" | "admin";
} | null;

type State = {
  view: View;
  hasHashView: boolean;
  params: ViewParams;
  user: User;
  userLoading: boolean;
  // Server-authoritative visitor country (Vercel geo) for currency defaults
  country: string | null;
  // navigation
  go: (view: View, params?: ViewParams) => void;
  back: () => void;
  // auth
  loadUser: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  upgrade: (variant: "monthly" | "annual", provider?: string) => Promise<void>;
};

function toHash(view: View, params: ViewParams): string {
  const parts = [`view=${view}`];
  for (const [k, v] of Object.entries(params)) {
    if (v) parts.push(`${k}=${encodeURIComponent(v)}`);
  }
  return `#/${parts.join("&")}`;
}

function fromHash(): { view: View; params: ViewParams } {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h) return { view: "home", params: {} };
  const sp = new URLSearchParams(h);
  const view = (sp.get("view") as View) || "home";
  sp.delete("view");
  const params: ViewParams = {};
  sp.forEach((v, k) => (params[k] = decodeURIComponent(v)));
  return { view, params };
}

export const useStore = create<State>((set, get) => ({
  // True when the URL carried a #/view=... boot state (hash routing active).
  hasHashView: typeof window !== "undefined" && /#[^?]*view=/.test(window.location.hash),
  view: "home",
  params: {},
  user: null,
  userLoading: true,
  country: null,

  go: (view, params = {}) => {
    set({ view, params });
    window.history.pushState(null, "", toHash(view, params));
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Track recently viewed (entity pages only)
    const entityViews = ["investor", "topic", "company", "year", "source", "passage", "concept", "event"];
    if (entityViews.includes(view) && (params.slug || params.id || params.year)) {
      try {
        const raw = localStorage.getItem("ip_recently_viewed");
        const prev: any[] = raw ? JSON.parse(raw) : [];
        const id = params.slug || params.id || params.year || "";
        const filtered = prev.filter((i) => !(i.view === view && i.slug === id));
        // Label known at navigation time (entity slugs); passages get their
        // label backfilled by PassageView once the source title loads.
        const label = view === "passage" ? "" : String(id).replace(/-/g, " ");
        const next = [{ view, slug: id, label, ts: Date.now() }, ...filtered].slice(0, 8);
        localStorage.setItem("ip_recently_viewed", JSON.stringify(next));
      } catch {}
    }
  },
  back: () => window.history.back(),

  loadUser: async () => {
    set({ userLoading: true });
    try {
      const data = await apiGet<{ user: User; country?: string | null }>("/api/me");
      set({ user: data.user, country: data.country ?? null, userLoading: false });
    } catch {
      set({ user: null, userLoading: false });
    }
  },
  signup: async (email, password, name) => {
    const data = await apiPost<{ user: User }>("/api/auth/signup", { email, password, name });
    track("signup_completed");
    set({ user: data.user });
  },
  login: async (email, password) => {
    const data = await apiPost<{ user: User }>("/api/auth/login", { email, password });
    set({ user: data.user });
  },
  logout: async () => {
    await apiPost("/api/auth/logout");
    set({ user: null });
    get().go("home");
  },
  upgrade: async (variant, provider?: string) => {
    const res: any = await apiPost("/api/checkout", { variant, ...(provider ? { provider } : {}) });
    if (res?.mode === "redirect" && res.url) {
      window.location.href = res.url;
      return;
    }
    await get().loadUser();
  },
}));

// Map legacy #/view=entity&slug=... direct-hash navigations to their clean
// real-path equivalents. Only fires on initial page load (a direct visit or
// shared link) — in-app go() uses pushState and never re-runs this module,
// so SPA navigation is unaffected. popstate just reflects state.
function legacyHashRedirect(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h) return false;
  const sp = new URLSearchParams(h);
  const view = sp.get("view") || "";
  const slug = sp.get("slug") || "";
  const investor = sp.get("investor") || "";
  const id = sp.get("id") || "";
  const year = sp.get("year") || "";
  const q = sp.get("q") || "";
  let clean: string | null = null;
  switch (view) {
    case "home": clean = "/"; break;
    case "search": clean = q ? `/search?q=${encodeURIComponent(q)}` : "/search"; break;
    case "compare": clean = "/compare"; break;
    case "investor": if (slug) clean = `/investors/${slug}`; break;
    case "company": if (slug) clean = `/companies/${slug}`; break;
    case "topic": if (slug && investor) clean = `/investors/${investor}/topics/${slug}`; break;
    case "event": if (slug) clean = `/events/${slug}`; break;
    case "year": if (year) clean = `/years/${year}`; break;
    case "theme": if (slug) clean = `/themes/${slug}`; break;
    case "source": if (slug) clean = `/sources/${slug}`; break;
    case "passage": if (id) clean = `/passages/${id}`; break;
    case "graph": clean = "/graph"; break;
    case "library": clean = "/library"; break;
    case "upgrade": clean = "/upgrade"; break;
    case "login": clean = "/login"; break;
    case "signup": clean = "/signup"; break;
  }
  if (clean) {
    // Use replace so we don't create a duplicate history entry.
    window.location.replace(clean);
    return true;
  }
  return false;
}

// Initialize from hash on first client load
if (typeof window !== "undefined") {
  if (!legacyHashRedirect()) {
    const { view, params } = fromHash();
    useStore.setState({ view, params });
  }
  window.addEventListener("popstate", () => {
    const { view, params } = fromHash();
    useStore.setState({ view, params });
  });
}
