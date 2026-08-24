"use client";
import { isAllAccess } from "@/lib/promo";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore, type View } from "@/stores/app-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Search, Bookmark, FolderOpen, User as UserIcon, LogOut, Bell, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/investor/theme-toggle";

type NotificationItem = { id: string; title: string; body: string; url: string; read: boolean; createdAt: string };

function NotificationsBell() {
  const go = useStore((s) => s.go);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiGet<{ unreadCount: number; notifications: NotificationItem[] }>("/api/notifications"),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as globalThis.Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  // Refresh badge on view changes.
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }, [qc]);

  const unread = data?.unreadCount ?? 0;
  const items = data?.notifications ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="nav-link relative inline-flex items-center gap-1.5"
        aria-label={`Notifications (${unread} unread)`}
      >
        <Bell className="h-3.5 w-3.5" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1 flex h-3 min-w-3 items-center justify-center bg-signal px-[3px] font-mono text-[0.55rem] font-bold leading-none text-paper">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 border border-ink bg-paper shadow-[4px_4px_0_0_var(--ink)]">
          <div className="flex items-center justify-between border-b border-rule px-3 py-2">
            <p className="kicker">NOTIFICATIONS</p>
            {unread > 0 && (
              <button
                onClick={async () => { await apiPost("/api/notifications", { all: true }); qc.invalidateQueries({ queryKey: ["notifications"] }); }}
                className="font-mono text-[0.6rem] uppercase text-graphite hover:text-ink"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-auto scroll-thin">
            {items.length === 0 && (
              <p className="px-3 py-4 font-reader text-sm text-graphite">
                Nothing yet. Follow an investor to hear about new material first.
              </p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => { setOpen(false); go("home"); window.location.hash = n.url.startsWith("#") ? n.url.slice(1) : `/${n.url}`; }}
                className={cn("block w-full border-b border-rule px-3 py-2 text-left hover:bg-paper-2 transition-colors", !n.read && "bg-paper-2")}
              >
                <p className="font-display text-sm font-semibold leading-tight">{n.title}</p>
                <p className="mt-0.5 font-reader text-xs text-graphite">{n.body}</p>
                <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-wider text-graphite">
                  {new Date(n.createdAt).toLocaleDateString()}
                  {!n.read && <span className="ml-2 text-signal-dark">● NEW</span>}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Masthead() {
  const { view, go, user, logout } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const navItems: { label: string; view: View; match: View[]; href?: string }[] = [
    // INVESTORS links to the crawlable, ISR-cached public directory — the SPA
    // view stays reachable from the directory itself.
    { label: "INVESTORS", view: "investors", match: ["investors", "investor", "topic", "company", "year", "source"], href: "/investors" },
    { label: "LEARN", view: "learn", match: ["learn"], href: "/learn" },
    { label: "SEARCH", view: "search", match: ["search"], href: "/search" },
    { label: "GRAPH", view: "graph", match: ["graph"] },
    { label: "TRAILS", view: "trails", match: ["trails", "trailDetail"] },
    { label: "COMPARE", view: "compare", match: ["compare"], href: "/compare" },
    { label: "LIBRARY", view: "library", match: ["library", "bookmarks", "searches", "collections", "watchlist"] },
  ];

  // Esc closes the mobile sheet; focus returns to the trigger.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const navigateFromMenu = (v: View, params?: Record<string, string>) => {
    setMenuOpen(false);
    go(v, params as never);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[60px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button onClick={() => go("home")} className="wordmark shrink-0" aria-label="Investor/Pass home">
          <span>INVESTOR</span>
          <span className="slash">/</span>
          <span>PASS</span>
        </button>

        <nav className="hidden items-center gap-5 text-[0.78rem] font-semibold sm:flex md:gap-7">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.view}
                href={item.href}
                data-active={item.match.includes(view)}
                className="nav-link"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.view}
                onClick={() => go(item.view)}
                data-active={item.match.includes(view)}
                className="nav-link"
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-3 text-[0.8rem] font-semibold">
          {/* Theme toggle */}
          <ThemeToggle />
          {/* Cmd+K hint */}
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="hidden items-center gap-1.5 border border-rule bg-paper-2 px-2 py-1 font-mono text-[0.65rem] text-graphite hover:border-ink hover:text-ink transition-colors lg:inline-flex"
            title="Command palette (Cmd+K)"
          >
            <Search className="h-3 w-3" />
            <kbd>⌘K</kbd>
          </button>
          {user ? (
            <>
              {/* PAYWALL DORMANT — Crown/PRO badge removed while all-access is on. */}
              <NotificationsBell />
              <button onClick={() => go("bookmarks")} className="nav-link hidden sm:inline-flex items-center gap-1.5" aria-label="Bookmarks">
                <Bookmark className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => go("account")} className="nav-link inline-flex items-center gap-1.5" aria-label="Account">
                <UserIcon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{user.name || user.email.split("@")[0]}</span>
              </button>
              <button onClick={logout} className="nav-link inline-flex items-center gap-1.5" aria-label="Log out">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => go("login")} className="nav-link">LOG IN</button>
              <button
                onClick={() => go("signup")}
                className="bg-ink px-3 py-1.5 text-paper hover:bg-signal-dark transition-colors"
              >
                SIGN UP
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav — full-screen sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-paper sm:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex min-h-[60px] items-center justify-between border-b border-ink px-4">
            <span className="wordmark"><span>INVESTOR</span><span className="slash">/</span><span>PASS</span></span>
            <button onClick={() => setMenuOpen(false)} className="nav-link p-2" autoFocus aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-auto px-4 py-4">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => navigateFromMenu(item.view)}
                data-active={item.match.includes(view)}
                className="block w-full border-b border-rule py-3 text-left font-display text-xl font-semibold tracking-tight hover:text-signal-dark"
              >
                {item.label}
              </button>
            ))}
            {user && (
              <>
                <button onClick={() => navigateFromMenu("watchlist")} className="block w-full border-b border-rule py-3 text-left font-display text-xl font-semibold tracking-tight hover:text-signal-dark">
                  WATCHLIST
                </button>
                <button onClick={() => navigateFromMenu("account")} className="block w-full border-b border-rule py-3 text-left font-display text-xl font-semibold tracking-tight hover:text-signal-dark">
                  ACCOUNT
                </button>
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="block w-full border-b border-rule py-3 text-left font-display text-xl font-semibold tracking-tight hover:text-signal-dark"
                >
                  LOG OUT
                </button>
              </>
            )}
          </nav>
          <div className="border-t border-ink px-4 py-4">
            {/* PAYWALL DORMANT — entitlement chip removed while all-access is on. */}
            {user ? (
              <p className="font-mono text-xs uppercase tracking-wider text-graphite">
                MEMBER · {user.name || user.email.split("@")[0]}
              </p>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => navigateFromMenu("login")} className="chip flex-1 justify-center">LOG IN</button>
                <button onClick={() => navigateFromMenu("signup")} className="flex-1 bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal-dark">SIGN UP</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile nav row (compact chips) */}
      <nav className="flex items-center gap-4 border-t border-rule px-4 py-2 text-[0.72rem] font-semibold sm:hidden">
        <button
          ref={menuBtnRef}
          onClick={() => setMenuOpen(true)}
          className="nav-link inline-flex items-center gap-1.5"
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu className="h-4 w-4" /> MENU
        </button>
        {navItems.slice(0, 2).map((item) => (
          <button
            key={item.view}
            onClick={() => go(item.view)}
            data-active={item.match.includes(view)}
            className="nav-link"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
