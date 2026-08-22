"use client";
import { useState, useEffect, useRef } from "react";
import { useStore, type View } from "@/stores/app-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Search, Bookmark, FolderOpen, User as UserIcon, LogOut, Crown, Bell } from "lucide-react";
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
  const navItems: { label: string; view: View; match: View[] }[] = [
    { label: "INVESTORS", view: "investors", match: ["investors", "investor", "topic", "company", "year", "source"] },
    { label: "SEARCH", view: "search", match: ["search"] },
{ label: "TRAILS", view: "trails", match: ["trails", "trailDetail"] },
{ label: "COMPARE", view: "compare", match: ["compare"] },
    { label: "LIBRARY", view: "library", match: ["library", "bookmarks", "searches", "collections"] },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[60px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button onClick={() => go("home")} className="wordmark shrink-0" aria-label="Investor/Pass home">
          <span>INVESTOR</span>
          <span className="slash">/</span>
          <span>PASS</span>
        </button>

        <nav className="hidden items-center gap-5 text-[0.78rem] font-semibold sm:flex md:gap-7">
          {navItems.map((item) => (
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
              {user.entitlement === "pro" && (
                <span className="hidden items-center gap-1 text-signal-dark sm:inline-flex">
                  <Crown className="h-3.5 w-3.5" /> PRO
                </span>
              )}
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

      {/* Mobile nav */}
      <nav className="flex items-center gap-4 border-t border-rule px-4 py-2 text-[0.72rem] font-semibold sm:hidden">
        {navItems.map((item) => (
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
