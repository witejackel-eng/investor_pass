"use client";
/**
 * Fire an analytics event on mount using the EXISTING track() pipeline
 * (POST /api/events → SearchEvent). For server-rendered public pages
 * (Learn, Newsletter) that need view telemetry. No new analytics stack.
 */
import { useEffect } from "react";
import { track } from "@/lib/client";

export function TrackView({ name, props }: { name: string; props?: Record<string, unknown> }) {
  useEffect(() => {
    track(name, props);
  }, []);
  return null;
}
