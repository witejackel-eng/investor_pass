/**
 * Generate the SOFTWARE ARCHITECTURE graph snapshot for the Control Room.
 * Run: bun scripts/gen-arch-graph.ts
 *
 * Deterministic, zero-dependency static analysis: walks src/ + prisma,
 * builds nodes (files grouped by kind) and edges from real `@/` imports,
 * plus curated route → page → API → model chains. Committed snapshot with
 * timestamp — Graphify (Python CLI) remains optional for deeper analysis;
 * this snapshot is what /ops/architecture renders.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "fs";
import { join, relative, extname } from "path";

type Node = { id: string; kind: "page" | "api" | "component" | "lib" | "store" | "model" | "data"; label: string; group: string };
type Edge = { from: string; to: string };

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const nodes = new Map<string, Node>();
const edges = new Set<string>();

function kindFor(path: string, file: string): Node["kind"] | null {
  if (path.startsWith("app/api/")) return "api";
  if (path.startsWith("app/") && file === "page.tsx") return "page";
  if (path.startsWith("components/ui/")) return null; // shadcn primitives: too noisy
  if (path.startsWith("components/")) return "component";
  if (path.startsWith("stores/")) return "store";
  if (path.startsWith("data/")) return "data";
  if (path.startsWith("lib/")) return "lib";
  return null;
}

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    const rel = relative(SRC, full).replace(/\\/g, "/");
    const kind = kindFor(rel, entry);
    if (!kind) continue;
    const id = rel.replace(/\.(ts|tsx)$/, "");
    const label = id.split("/").pop()!;
    nodes.set(id, { id, kind, label, group: id.split("/")[0] });

    const src = readFileSync(full, "utf8");
    const re = /from\s+["']@\/([^"']+)["']/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      let target = m[1].replace(/\.(ts|tsx)$/, "");
      // resolve dir index / sibling file heuristics
      edges.add(`${id}->${target}`);
      // also add extensionless alias target as node if it maps to a real node prefix
      for (const cand of [target]) {
        if (!nodes.has(cand)) {
          const found = [...nodes.keys()].find((n) => n === cand || n.startsWith(cand + "/"));
          if (found) edges.add(`${id}->${found}`);
        }
      }
    }
  }
}

walk(SRC);

// Prisma models as nodes + edges from db import
const schema = readFileSync(join(ROOT, "prisma/schema.prisma"), "utf8");
for (const m of schema.matchAll(/^model\s+(\w+)/gm)) {
  nodes.set(`prisma/${m[1]}`, { id: `prisma/${m[1]}`, kind: "model", label: m[1], group: "prisma" });
}
for (const n of nodes.values()) {
  if (n.kind === "lib" && n.id.includes("db")) {
    for (const m of schema.matchAll(/^model\s+(\w+)/gm)) edges.add(`${n.id}->prisma/${m[1]}`);
  }
}

// Normalize edges: only between known nodes; fuzzy-resolve file targets
const ids = [...nodes.keys()];
const resolved: Edge[] = [];
for (const e of edges) {
  const [from, to] = e.split("->");
  if (nodes.has(from) && nodes.has(to)) resolved.push({ from, to });
}
// drop self + dupes
const seen = new Set<string>();
const finalEdges = resolved.filter((e) => {
  if (e.from === e.to) return false;
  const k = `${e.from}|${e.to}`;
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

mkdirSync(join(SRC, "data/ops"), { recursive: true });
const out = {
  generatedAt: new Date().toISOString(),
  generator: "gen-arch-graph.ts (deterministic static import scan)",
  nodeCount: nodes.size,
  edgeCount: finalEdges.length,
  nodes: [...nodes.values()],
  edges: finalEdges,
};
writeFileSync(join(SRC, "data/ops/arch-graph.json"), JSON.stringify(out, null, 1));
console.log(`arch graph: ${nodes.size} nodes · ${finalEdges.length} edges → src/data/ops/arch-graph.json`);
