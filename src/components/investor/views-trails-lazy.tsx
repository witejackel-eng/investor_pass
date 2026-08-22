"use client";
/**
 * Lazy boundary for research trails — keeps trails.json out of the main chunk.
 */
import { TrailsIndex, TrailDetail, type Trail } from "@/components/investor/views-trails";
import type { View, ViewParams } from "@/stores/app-store";
import trailsData from "@/data/trails/trails.json";

type Go = (view: View, params?: ViewParams) => void;

export function TrailsLazy({ slug, go }: { slug?: string; go: Go }) {
  const trails = trailsData as Trail[];
  const open = (s: string) => go("trailDetail", { slug: s });
  if (slug) {
    const trail = trails.find((t) => t.slug === slug);
    return trail ? <TrailDetail trail={trail} onBack={() => go("trails")} /> : <TrailsIndex trails={trails} onOpen={open} />;
  }
  return <TrailsIndex trails={trails} onOpen={open} />;
}
