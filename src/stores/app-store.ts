/**
 * Investor/Pass — SPA view-state store.
 *
 * Because only `/` is user-visible, the product is delivered as a single-page
 * application with a Zustand view-state router. Views are addressable by
 * `view` + `params` and the browser history is updated with the hash so deep
 * links and back/forward work.
 */
import { create } from "zustand";
import { apiGet, apiPost, apiDelete } from "@/lib/client";

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
  | "library"
  | "bookmarks"
  | "searches"
  | "collections"
  | "account"
  | "upgrade"
  | "login"
  | "signup"
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
  params: ViewParams;
  user: User;
  userLoading: boolean;
  // navigation
  go: (view: View, params?: ViewParams) => void;
  back: () => void;
  // auth
  loadUser: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  upgrade: (variant: "monthly" | "annual") => Promise<void>;
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
  view: "home",
  params: {},
  user: null,
  userLoading: true,

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
        const next = [{ view, slug: id, label: "", ts: Date.now() }, ...filtered].slice(0, 8);
        localStorage.setItem("ip_recently_viewed", JSON.stringify(next));
      } catch {}
    }
  },
  back: () => window.history.back(),

  loadUser: async () => {
    set({ userLoading: true });
    try {
      const data = await apiGet<{ user: User }>("/api/me");
      set({ user: data.user, userLoading: false });
    } catch {
      set({ user: null, userLoading: false });
    }
  },
  signup: async (email, password, name) => {
    const data = await apiPost<{ user: User }>("/api/auth/signup", { email, password, name });
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
  upgrade: async (variant) => {
    await apiPost("/api/checkout", { variant });
    await get().loadUser();
  },
}));

// Initialize from hash on first client load
if (typeof window !== "undefined") {
  const { view, params } = fromHash();
  useStore.setState({ view, params });
  window.addEventListener("popstate", () => {
    const { view, params } = fromHash();
    useStore.setState({ view, params });
  });
}
