"use client";
import { useEffect } from "react";
import { useStore } from "@/stores/app-store";

/**
 * Global keyboard shortcuts:
 *  /       → focus search (navigates to search view and focuses input)
 *  g h     → go home
 *  g i     → go to investors
 *  g s     → go to search
 *  g l     → go to library
 *  g u     → go to upgrade
 *  Escape  → go back
 */
export function useKeyboardShortcuts() {
  const go = useStore((s) => s.go);
  const back = useStore((s) => s.back);

  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)) {
        // Allow Escape to blur
        if (e.key === "Escape") {
          (target as HTMLElement).blur();
        }
        return;
      }

      // / → focus search
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        go("search");
        // Focus the search input after navigation
        setTimeout(() => {
          const input = document.querySelector('input[aria-label="Search the library"]') as HTMLInputElement;
          input?.focus();
        }, 100);
        return;
      }

      // Escape → go back
      if (e.key === "Escape") {
        back();
        return;
      }

      // g + key sequences
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        if (gPressed) return;
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 800);
        return;
      }

      if (gPressed) {
        gPressed = false;
        if (gTimer) clearTimeout(gTimer);
        switch (e.key) {
          case "h": e.preventDefault(); go("home"); break;
          case "i": e.preventDefault(); go("investors"); break;
          case "s": e.preventDefault(); go("search"); break;
          case "l": e.preventDefault(); go("library"); break;
          case "u": e.preventDefault(); go("upgrade"); break;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [go, back]);
}
