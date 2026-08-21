"use client";
import { useStore, type View } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { Search, Bookmark, FolderOpen, User as UserIcon, LogOut, Crown } from "lucide-react";

export function Masthead() {
  const { view, go, user, logout } = useStore();
  const navItems: { label: string; view: View; match: View[] }[] = [
    { label: "INVESTORS", view: "investors", match: ["investors", "investor", "topic", "company", "year", "source"] },
    { label: "SEARCH", view: "search", match: ["search"] },
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
