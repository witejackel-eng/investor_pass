/**
 * Investor/Pass — SPA view-state store.
 *
 * The product is a single-page application with a Zustand view-state router.
 * Views are addressable by `view` + `params` and the browser history is
 * updated with CLEAN real-path URLs via pushState (no hash) so the address
 * bar stays shareable and indexable. Legacy `#/view=…` links are redirected
 * to their clean equivalents on first load.
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

// Map a view + params to a CLEAN real-path URL (no hash). Every view maps to
// a real Next.js route — either a public server-rendered page
// (/investors/[slug], /companies/[slug], …) or a thin AppRoot-wrapper route
// (/search, /login, /library, …). pushState to these paths gives instant
// in-app navigation while keeping the address bar clean & shareable.
function toPath(view: View, params: ViewParams): string {
  const p = params || {};
  const enc = (s: string) => encodeURIComponent(s);
  const q = new URLSearchParams();
  switch (view) {
    case "home": return "/";
    case "search": {
      if (p.q) q.set("q", p.q);
      if (p.person) q.set("person", p.person);
      if (p.theme) q.set("theme", p.theme);
      if (p.company) q.set("company", p.company);
      if (p.concept) q.set("concept", p.concept);
      if (p.event) q.set("event", p.event);
      return q.toString() ? `/search?${q.toString()}` : "/search";
    }
    case "compare": {
      if (p.person) q.set("person", p.person);
      if (p.theme) q.set("theme", p.theme);
      return q.toString() ? `/compare?${q.toString()}` : "/compare";
    }
    case "investors": return "/investors";
    case "investor": return p.slug ? `/investors/${enc(p.slug)}` : "/investors";
    case "timeline": return p.slug ? `/timeline/${enc(p.slug)}` : "/investors";
    case "topic": return p.slug && p.investor ? `/investors/${enc(p.investor)}/topics/${enc(p.slug)}` : "/investors";
    case "company": return p.slug ? `/companies/${enc(p.slug)}` : "/";
    case "year": return p.year ? `/years/${enc(p.year)}` : "/";
    case "source": return p.slug ? `/sources/${enc(p.slug)}` : "/";
    case "passage": return p.id ? `/passages/${enc(p.id)}` : "/";
    case "concept": return p.slug ? `/concepts/${enc(p.slug)}` : "/";
    case "event": return p.slug ? `/events/${enc(p.slug)}` : "/";
    case "trails": return "/trails";
    case "trailDetail": return p.slug ? `/trails/${enc(p.slug)}` : "/trails";
    case "graph": return "/graph";
    case "library": return "/library";
    case "bookmarks": return "/bookmarks";
    case "searches": return "/searches";
    case "collections": return "/collections";
    case "watchlist": return "/watchlist";
    case "account": return "/account";
    case "upgrade": return "/upgrade";
    case "login": return "/login";
    case "signup": return "/signup";
    case "forgot": return "/forgot";
    case "reset": return p.token ? `/reset?token=${enc(p.token)}` : "/forgot";
    case "admin": return "/admin";
    case "learn": return "/learn";
    default: return "/";
  }
}

// Parse the current real path (pathname + search) into a view + params.
// Inverse of toPath. Used on initial load and on popstate (back/forward).
function fromPath(): { view: View; params: ViewParams } {
  if (typeof window === "undefined") return { view: "home", params: {} };
  const path = window.location.pathname;
  const sp = new URLSearchParams(window.location.search);
  const qparams: ViewParams = {};
  sp.forEach((v, k) => { qparams[k] = v; });
  if (path === "/" || path === "") return { view: "home", params: qparams };
  if (path === "/search") return { view: "search", params: qparams };
  if (path === "/compare") return { view: "compare", params: qparams };
  if (path === "/investors") return { view: "investors", params: qparams };
  if (path === "/trails") return { view: "trails", params: qparams };
  if (path === "/graph") return { view: "graph", params: qparams };
  if (path === "/library") return { view: "library", params: qparams };
  if (path === "/bookmarks") return { view: "bookmarks", params: qparams };
  if (path === "/searches") return { view: "searches", params: qparams };
  if (path === "/collections") return { view: "collections", params: qparams };
  if (path === "/watchlist") return { view: "watchlist", params: qparams };
  if (path === "/account") return { view: "account", params: qparams };
  if (path === "/upgrade") return { view: "upgrade", params: qparams };
  if (path === "/login") return { view: "login", params: qparams };
  if (path === "/signup") return { view: "signup", params: qparams };
  if (path === "/forgot") return { view: "forgot", params: qparams };
  if (path === "/reset") return { view: "reset", params: qparams };
  if (path === "/admin") return { view: "admin", params: qparams };
  if (path === "/learn") return { view: "learn", params: qparams };
  let m: RegExpMatchArray | null;
  if ((m = path.match(/^\/investors\/([^/]+)\/topics\/([^/]+)$/)))
    return { view: "topic", params: { ...qparams, investor: decodeURIComponent(m[1]), slug: decodeURIComponent(m[2]) } };
  if ((m = path.match(/^\/investors\/([^/]+)$/)))
    return { view: "investor", params: { ...qparams, slug: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/companies\/([^/]+)$/)))
    return { view: "company", params: { ...qparams, slug: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/events\/([^/]+)$/)))
    return { view: "event", params: { ...qparams, slug: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/years\/([^/]+)$/)))
    return { view: "year", params: { ...qparams, year: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/sources\/([^/]+)$/)))
    return { view: "source", params: { ...qparams, slug: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/passages\/([^/]+)$/)))
    return { view: "passage", params: { ...qparams, id: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/concepts\/([^/]+)$/)))
    return { view: "concept", params: { ...qparams, slug: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/timeline\/([^/]+)$/)))
    return { view: "timeline", params: { ...qparams, slug: decodeURIComponent(m[1]) } };
  if ((m = path.match(/^\/trails\/([^/]+)$/)))
    return { view: "trailDetail", params: { ...qparams, slug: decodeURIComponent(m[1]) } };
  // Unknown path — default to home; the Next route will render whatever page
  // actually lives at that path.
  return { view: "home", params: qparams };
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
    window.history.pushState(null, "", toPath(view, params));
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

// Map legacy #/view=... direct-hash navigations to their clean real-path
// equivalents. Covers EVERY view so any old shared link still forwards to a
// working clean URL instead of crashing. Only fires on initial page load
// (a direct visit or shared link) — in-app go() uses pushState with clean
// paths and never re-runs this module, so SPA navigation is unaffected.
function legacyHashRedirect(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h) return false;
  const sp = new URLSearchParams(h);
  const view = (sp.get("view") as View) || "";
  if (!view) return false;
  sp.delete("view");
  const params: ViewParams = {};
  sp.forEach((v, k) => { params[k] = decodeURIComponent(v); });
  // Reuse the same mapping as toPath; if it produces a hash-less clean path,
  // redirect there. (toPath always returns a clean path for every view.)
  const clean = toPath(view, params);
  if (clean && clean !== "/") {
    window.location.replace(clean);
    return true;
  }
  if (view === "home") {
    // toPath("home") returns "/" — only redirect if we're not already there.
    if (window.location.pathname !== "/") {
      window.location.replace("/");
      return true;
    }
  }
  return false;
}

// Initialize from the real path on first client load (clean URLs, no hash).
if (typeof window !== "undefined") {
  if (!legacyHashRedirect()) {
    const { view, params } = fromPath();
    useStore.setState({ view, params });
  }
  window.addEventListener("popstate", () => {
    const { view, params } = fromPath();
    useStore.setState({ view, params });
  });
}
