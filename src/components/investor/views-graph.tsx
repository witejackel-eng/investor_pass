"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/client";
import { useStore } from "@/stores/app-store";
import { ArrowRight, X } from "lucide-react";

// ── API shapes (mirror src/lib/server/graph.ts) ─────────────────────────────

type NetworkNode = {
  id: string;
  kind: "investor" | "theme";
  label: string;
  slug: string | null;
  href: string | null;
  weight: number;
  communityId: number | null;
};
type NetworkLink = { source: string; target: string; relation: string; weight: number };
type Network = { investors: NetworkNode[]; themes: NetworkNode[]; links: NetworkLink[] };

type Neighbor = {
  id: string;
  kind: string;
  label: string;
  href: string | null;
  relation: string;
  direction: "out" | "in";
  weight: number;
};
type NodeDetail = {
  node: { id: string; kind: string; label: string; href: string | null; weight: number; communityId: number | null };
  neighbors: Neighbor[];
};

// ── Layout ───────────────────────────────────────────────────────────────────

type Point = { node: NetworkNode; x: number; y: number; vx: number; vy: number };

const COMMUNITY_COLORS = [
  "#1736a5", "#8a5a2b", "#3d6b3d", "#7a2d2d", "#5b4a86",
  "#20606b", "#86651f", "#5d3a63", "#2f5bff", "#456173",
];

function communityColor(id: number | null): string {
  if (id === null) return "#5b5952";
  return COMMUNITY_COLORS[Math.abs(id) % COMMUNITY_COLORS.length];
}

/** Deterministic simple force-directed layout, animated with rAF. */
function useForceLayout(network: Network | undefined, width: number, height: number) {
  const [points, setPoints] = useState<Point[]>([]);
  const [tick, setTick] = useState(0);
  const stateRef = useRef<{ pts: Point[]; links: NetworkLink[]; energy: number } | null>(null);

  useEffect(() => {
    if (!network || width === 0) return;
    const nodes = [...network.investors, ...network.themes];
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 60;
    const pts: Point[] = nodes.map((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      return {
        node,
        x: cx + radius * Math.cos(angle) * (0.75 + Math.random() * 0.25),
        y: cy + radius * Math.sin(angle) * (0.75 + Math.random() * 0.25),
        vx: 0,
        vy: 0,
      };
    });
    stateRef.current = { pts, links: network.links, energy: 1 };
    setPoints(pts);

    let raf = 0;
    let rounds = 0;
    const maxRounds = 260;

    const step = () => {
      const s = stateRef.current;
      if (!s) return;
      rounds++;
      const n = s.pts.length;

      // Pairwise repulsion (n is small — ~60 nodes).
      for (let i = 0; i < n; i++) {
        const a = s.pts[i];
        for (let j = i + 1; j < n; j++) {
          const b = s.pts[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) { d2 = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5; }
          const d = Math.sqrt(d2);
          const isInvestorPair = a.node.kind === "investor" && b.node.kind === "investor";
          const strength = isInvestorPair ? 5200 : 2600;
          const f = Math.min(strength / d2, 6);
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }
      }

      // Springs on links.
      const byId = new Map(s.pts.map((p) => [p.node.id, p]));
      for (const l of s.links) {
        const a = byId.get(l.source);
        const b = byId.get(l.target);
        if (!a || !b) continue;
        const rest = a.node.kind === "investor" && b.node.kind === "investor" ? 150 : 80;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const k = 0.012;
        const f = ((d - rest) * k);
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }

      // Center gravity + integrate + bounds.
      let energy = 0;
      for (const p of s.pts) {
        p.vx += (cx - p.x) * 0.0025;
        p.vy += (cy - p.y) * 0.0025;
        p.vx *= 0.82; p.vy *= 0.82;
        p.x += p.vx; p.y += p.vy;
        energy += Math.abs(p.vx) + Math.abs(p.vy);
        p.x = Math.max(30, Math.min(width - 30, p.x));
        p.y = Math.max(26, Math.min(height - 26, p.y));
      }
      s.energy = energy / n;

      setTick((t) => t + 1);
      if (rounds < maxRounds && s.energy > 0.08) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [network, width, height]);

  // Re-read live positions on each tick without re-creating the array identity
  // consumers rely on (positions are mutated in place).
  useEffect(() => { /* points updated in place; tick drives re-render */ }, [tick]);
  return points;
}

// ── Detail panel ─────────────────────────────────────────────────────────────

const RELATION_LABELS: Record<string, string> = {
  SHARED_THEME: "shared themes",
  SHARED_COMPANY: "shared companies",
  FOCUSES_ON: "core theme",
  WROTE: "wrote",
  MADE: "decision",
  REGARDING: "regarding",
  ASSOCIATED_WITH: "associated with",
  CONTAINS: "contains",
  TAGGED: "tagged",
  MENTIONS: "mentions",
  PUBLISHED_IN: "published in",
  RELATED_TO: "related to",
  COVERS: "covers",
  REFERENCES: "references",
};

function NodePanel({ nodeId, onClose }: { nodeId: string; onClose: () => void }) {
  const go = useStore((s) => s.go);
  const { data, isLoading } = useQuery({
    queryKey: ["graph-node", nodeId],
    queryFn: () => apiGet<NodeDetail>(`/api/graph/node?id=${encodeURIComponent(nodeId)}`),
    staleTime: 10 * 60 * 1000,
  });

  const neighbors = data?.neighbors ?? [];
  const crossInvestors = neighbors.filter((nb) => nb.kind === "investor");
  const themes = neighbors.filter((nb) => nb.kind === "theme").slice(0, 10);
  const companies = neighbors.filter((nb) => nb.kind === "company").slice(0, 8);
  // ≤120 items — a plain loop is cheaper than memoizing.
  const counts = new Map<string, number>();
  for (const nb of neighbors) counts.set(nb.kind, (counts.get(nb.kind) ?? 0) + 1);

  return (
    <aside className="border border-ink bg-paper-2 lg:w-[340px] lg:shrink-0">
      <div className="flex items-start justify-between border-b border-ink px-4 py-3">
        <div>
          <p className="kicker text-signal-dark">{data ? data.node.kind.toUpperCase() : "NODE"}</p>
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight">
            {data?.node.label ?? "…"}
          </h3>
          {data && (
            <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
              {data.node.weight.toLocaleString()} connections
              {data.node.communityId !== null && ` · community ${data.node.communityId}`}
            </p>
          )}
        </div>
        <button onClick={onClose} className="nav-link p-1" aria-label="Close panel">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[520px] space-y-5 overflow-y-auto scroll-thin px-4 py-4">
        {isLoading && <p className="font-reader text-sm text-graphite">Mapping connections…</p>}

        {crossInvestors.length > 0 && (
          <section>
            <p className="kicker mb-2">CONNECTED INVESTORS</p>
            <div className="space-y-1.5">
              {crossInvestors.map((nb) => (
                <button
                  key={nb.id + nb.relation}
                  onClick={() => {
                    const slug = nb.id.replace("person:", "");
                    go("investor", { slug });
                  }}
                  className="flex w-full items-center justify-between border-b border-rule py-1.5 text-left hover:text-signal-dark"
                >
                  <span className="font-display text-sm font-semibold">{nb.label}</span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-graphite">
                    {nb.weight} {RELATION_LABELS[nb.relation] ?? nb.relation}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {themes.length > 0 && (
          <section>
            <p className="kicker mb-2">THEMES</p>
            <div className="flex flex-wrap gap-1.5">
              {themes.map((nb) => (
                <button
                  key={nb.id}
                  onClick={() => go("search", { theme: nb.id.replace("theme:", "") })}
                  className="chip"
                >
                  {nb.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {companies.length > 0 && (
          <section>
            <p className="kicker mb-2">COMPANIES</p>
            <div className="flex flex-wrap gap-1.5">
              {companies.map((nb) => (
                <button
                  key={nb.id}
                  onClick={() => go("search", { company: nb.id.replace("company:", "") })}
                  className="chip"
                >
                  {nb.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {data && (
          <section>
            <p className="kicker mb-2">IN THE GRAPH</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
              {[...counts.entries()].map(([kind, n]) => (
                <span key={kind}>{n}× {kind}</span>
              ))}
            </div>
          </section>
        )}

        {data?.node.kind === "investor" && (
          <button
            onClick={() => go("investor", { slug: data.node.id.replace("person:", "") })}
            className="flex w-full items-center justify-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-signal-dark transition-colors"
          >
            OPEN PROFILE <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
}

// ── View ─────────────────────────────────────────────────────────────────────

export function GraphView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [container, setContainer] = useState<{ w: number; h: number }>({ w: 0, h: 560 });
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: network, isLoading } = useQuery({
    queryKey: ["graph-network"],
    queryFn: () => apiGet<Network>("/api/graph/network"),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = w < 640 ? 460 : 620;
      setContainer({ w, h });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const points = useForceLayout(network, container.w, container.h);
  const byId = useMemo(() => new Map(points.map((p) => [p.node.id, p])), [points.length, points]);
  const maxWeight = useMemo(
    () => Math.max(1, ...(network?.investors.map((i) => i.weight) ?? [1])),
    [network]
  );

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-t-2 border-ink pt-4">
        <p className="kicker">/ GRAPH</p>
        <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
          The network of <span className="text-signal-dark">ideas.</span>
        </h1>
        <p className="mt-3 max-w-[680px] font-reader text-lg text-graphite">
          Every investor in the library, cross-referenced by the themes they return to and the
          companies they discuss. Solid lines connect investors who share ground; dotted lines are
          the themes themselves. Click any node to explore.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <div ref={wrapRef} className="relative min-w-0 flex-1 border border-ink bg-paper">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-mono text-xs uppercase tracking-wider text-graphite">
                Building the network…
              </p>
            </div>
          )}
          {container.w > 0 && network && (
            <svg
              viewBox={`0 0 ${container.w} ${container.h}`}
              width="100%"
              height={container.h}
              role="img"
              aria-label="Investor cross-reference network graph"
              className="block"
            >
              {/* links */}
              {network.links.map((l, i) => {
                const a = byId.get(l.source);
                const b = byId.get(l.target);
                if (!a || !b) return null;
                const cross = l.relation !== "FOCUSES_ON";
                const active = selected === l.source || selected === l.target;
                return (
                  <line
                    key={`${l.source}-${l.target}-${i}`}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={active ? "#1736a5" : cross ? "#5b5952" : "#c9c3b7"}
                    strokeWidth={cross ? Math.min(1 + l.weight / 10, 3.5) : 1}
                    strokeDasharray={cross ? undefined : "2 4"}
                    opacity={selected && !active ? 0.15 : cross ? 0.55 : 0.8}
                  />
                );
              })}
              {/* nodes */}
              {points.map((p) => {
                const isInvestor = p.node.kind === "investor";
                const r = isInvestor
                  ? 10 + Math.round(12 * (p.node.weight / maxWeight))
                  : 5;
                const active = selected === p.node.id;
                const dimmed = selected && !active &&
                  !network.links.some(
                    (l) =>
                      (l.source === selected && l.target === p.node.id) ||
                      (l.target === selected && l.source === p.node.id)
                  );
                return (
                  <g
                    key={p.node.id}
                    transform={`translate(${p.x}, ${p.y})`}
                    onClick={() => setSelected(p.node.id)}
                    className="cursor-pointer"
                    opacity={dimmed ? 0.25 : 1}
                  >
                    <circle
                      r={r}
                      fill={isInvestor ? "#11110f" : communityColor(p.node.communityId)}
                      stroke={active ? "#1736a5" : "#11110f"}
                      strokeWidth={active ? 3 : 1}
                    />
                    {(isInvestor || active || p.node.weight > 600) && (
                      <text
                        y={isInvestor ? -(r + 6) : -r - 3}
                        textAnchor="middle"
                        className="select-none"
                        fontSize={isInvestor ? 11 : 9}
                        fontWeight={isInvestor ? 700 : 500}
                        fill="#11110f"
                      >
                        {p.node.label.length > 22 ? `${p.node.label.slice(0, 20)}…` : p.node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
          {network && (
            <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-3 font-mono text-[0.55rem] uppercase tracking-wider text-graphite">
              <span>● investor</span>
              <span style={{ color: communityColor(3) }}>● theme (colored by community)</span>
              <span>── shared themes/companies</span>
              <span>┄ theme link</span>
            </div>
          )}
        </div>

        {selected ? (
          <NodePanel nodeId={selected} onClose={() => setSelected(null)} />
        ) : (
          <aside className="border border-rule bg-paper-2/60 p-5 lg:w-[340px] lg:shrink-0">
            <p className="kicker text-signal-dark">CROSS-REFERENCING</p>
            <h3 className="mt-2 font-display text-xl font-bold tracking-tight">
              Every entity, connected.
            </h3>
            <p className="prose-reader mt-2 text-sm">
              The whole library — investors, sources, references, themes, concepts, companies,
              events, years, decisions — is one graph. Investors link to each other through the
              themes they both return to and the companies they both discuss, with the strength of
              each connection derived from the passages themselves.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-rule pt-4 font-mono text-[0.62rem] uppercase tracking-wider text-graphite">
              <div><p className="font-display text-2xl font-bold text-ink">{network?.investors.length ?? "—"}</p>investors mapped</div>
              <div><p className="font-display text-2xl font-bold text-ink">{network?.themes.length ?? "—"}</p>core themes</div>
              <div><p className="font-display text-2xl font-bold text-ink">{network?.links.filter((l) => l.relation !== "FOCUSES_ON").length ?? "—"}</p>investor links</div>
              <div><p className="font-display text-2xl font-bold text-ink">{network?.links.filter((l) => l.relation === "FOCUSES_ON").length ?? "—"}</p>theme links</div>
            </div>
            <p className="mt-4 font-mono text-[0.55rem] uppercase tracking-wider text-graphite">
              Select any node in the map to open its connections.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
