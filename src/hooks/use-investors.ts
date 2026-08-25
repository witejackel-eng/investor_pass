"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client";

export type InvestorLite = {
  slug: string;
  name: string;
  shortDescription: string | null;
  bio: string | null;
  status: string;
  birthYear: number | null;
  // Persona class ("investor" | "founder") + region ("us" | "china" | "india" | null)
  // — powers the compare picker's grouping and the founders surface.
  kind: string;
  region: string | null;
  sourceCount: number;
  decisionCount: number;
  yearSpan: { from: number; to: number } | null;
};

/** Shared investors list query — dedupes home/investors/compare fetches. */
export function useInvestors() {
  return useQuery({
    queryKey: ["investors"],
    queryFn: () => apiGet<{ investors: InvestorLite[] }>("/api/investors"),
    select: (d) => d.investors,
    staleTime: 5 * 60_000,
  });
}
