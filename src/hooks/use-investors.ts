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
