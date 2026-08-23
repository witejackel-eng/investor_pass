import { GraphExplorer } from "../graph-clients";
import arch from "@/data/ops/arch-graph.json";
import gmeta from "@/data/ops/graphify-meta.json";

export const dynamic = "force-dynamic";

export default function OpsArchitecture() {
  const g = arch as unknown as {
    generatedAt: string; generator: string; nodeCount: number; edgeCount: number;
    nodes: { id: string; kind: string; label: string; group: string }[];
    edges: { from: string; to: string }[];
  };
  // High-coupling: top 10 by out-degree
  const deg = new Map<string, number>();
  for (const e of g.edges) deg.set(e.from, (deg.get(e.from) ?? 0) + 1);
  const hot = [...deg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Architecture — the software graph</h1>
        <p className="ops-kicker mt-1">
          SNAPSHOT {g.generatedAt.slice(0, 19)}Z · {g.nodeCount} NODES · {g.edgeCount} IMPORT EDGES · {g.generator}
        </p>
        <p className="mt-2 text-xs text-[var(--ops-mute)]">
          Static import scan of src/ + prisma models. Graphify (Graphify-Labs/graphify, Apache-2.0) remains an optional
          deeper analyzer — this snapshot is what renders here; the PUBLIC product never depends on either.
        </p>
      </div>

      <div className="ops-card">
        <p className="ops-kicker mb-2">GRAPHIFY SNAPSHOT — full repo map</p>
        <p className="text-xs">
          {gmeta.nodes.toLocaleString()} nodes · {gmeta.edges.toLocaleString()} edges · {gmeta.communities} communities —
          generated {String(gmeta.generatedAt).slice(0, 19)}Z via <code>graphify update .</code> (deterministic tree-sitter AST, no LLM).
        </p>
        <a className="ops-link text-xs font-bold" href="/api/ops/graphify" target="_blank" rel="noopener noreferrer">
          OPEN GRAPHIFY MAP (interactive graph.html) ↗
        </a>
        <span className="ops-kicker ml-2">private — Control Room session required</span>
      </div>

      <div className="ops-card">
        <p className="ops-kicker mb-2">HIGH-COUPLING MODULES (out-degree)</p>
        <div className="flex flex-wrap gap-2">
          {hot.map(([id, n]) => (
            <span key={id} className="border border-[var(--ops-rule)] px-2 py-1 text-[0.68rem]">
              {id} <span className="ops-blue font-bold">→{n}</span>
            </span>
          ))}
        </div>
      </div>

      <GraphExplorer
        nodes={g.nodes.map((n) => ({ id: n.id, kind: n.kind.toUpperCase(), label: n.label }))}
        edges={g.edges.map((e) => ({ from: e.from, to: e.to }))}
        layers={["PAGE", "API", "COMPONENT", "LIB", "STORE", "DATA", "MODEL", "other"]}
      />
    </div>
  );
}
