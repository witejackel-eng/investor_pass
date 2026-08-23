"use client";
/**
 * Control Room interactive clients: graph explorer (shared by the software
 * and evidence graphs: search, click node, adjacency, zoom/pan) and the
 * integrity/issues action row.
 */
import { useEffect, useMemo, useRef, useState } from "react";

export type GNode = { id: string; type?: string; kind?: string; label: string; meta?: string };
export type GEdge = { from: string; to: string; rel?: string };

export function GraphExplorer({
  nodes,
  edges,
  layers,
}: {
  nodes: GNode[];
  edges: GEdge[];
  layers: string[]; // ordered column types top→bottom
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const typeOf = (n: GNode) => String(n.type ?? n.kind ?? "other");
  // Cheap grouping (~160 nodes) — computed directly, no memoization needed.
  const byLayer = (() => {
    const cols = new Map<string, GNode[]>();
    for (const n of nodes) {
      const t = typeOf(n);
      const col = layers.includes(t) ? t : "other";
      if (!cols.has(col)) cols.set(col, []);
      cols.get(col)!.push(n);
    }
    return cols;
  })();

  const matched = useMemo(() => {
    if (!q.trim()) return null;
    const l = q.toLowerCase();
    return new Set(nodes.filter((n) => n.label.toLowerCase().includes(l) || n.id.toLowerCase().includes(l)).map((n) => n.id));
  }, [q, nodes]);

  const selNode = nodes.find((n) => n.id === sel) ?? null;
  const out = edges.filter((e) => e.from === sel);
  const inc = edges.filter((e) => e.to === sel);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Search nodes"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search nodes…"
          className="border border-[var(--ops-rule)] bg-[var(--ops-card)] px-3 py-1.5 text-xs outline-none focus:border-[var(--ops-ink)]"
          style={{ minWidth: 220 }}
        />
        <button className="ops-btn-ghost" onClick={() => setZoom((z) => Math.min(2, z + 0.15))}>ZOOM +</button>
        <button className="ops-btn-ghost" onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}>ZOOM −</button>
        <button className="ops-btn-ghost" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>RESET</button>
        <span className="ops-kicker">{nodes.length} NODES · {edges.length} EDGES · click a node for adjacency</span>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <div
          className="ops-card overflow-auto"
          style={{ maxHeight: 560, cursor: dragging ? "grabbing" : "grab" }}
          tabIndex={0}
          aria-label="Graph canvas — drag to pan"
          onPointerDown={(e) => { drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; setDragging(true); }}
          onPointerMove={(e) => { if (drag.current) setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y }); }}
          onPointerUp={() => { drag.current = null; setDragging(false); }}
          onPointerLeave={() => { drag.current = null; setDragging(false); }}
        >
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", transition: "transform 0.05s linear" }}>
            {[...byLayer.entries()].map(([layer, list]) => (
              <div key={layer} className="mb-3">
                <p className="ops-kicker mb-1">{layer} ({list.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((n) => {
                    const isMatch = matched?.has(n.id) ?? false;
                    const isSel = n.id === sel;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSel(n.id)}
                        className="border px-2 py-1 text-[0.68rem]"
                        style={{
                          borderColor: isSel ? "var(--ops-blue)" : "var(--ops-rule)",
                          background: isSel ? "rgba(22,71,216,0.08)" : isMatch && matched ? "rgba(22,71,216,0.16)" : "var(--ops-card)",
                          color: isMatch && matched ? "var(--ops-blue-dark)" : "inherit",
                          fontWeight: isSel || (isMatch && matched) ? 700 : 400,
                        }}
                        title={n.id}
                      >
                        {n.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="ops-card" style={{ maxHeight: 560, overflowY: "auto" }} aria-label="Selected node">
          {!selNode ? (
            <p className="ops-kicker">SELECT A NODE — details + upstream/downstream</p>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <p className="ops-kicker">NODE</p>
                <p className="text-sm font-bold">{selNode.label}</p>
                <p className="text-[0.65rem] break-all text-[var(--ops-mute)]">{selNode.id}</p>
                <p className="mt-1">{typeOf(selNode).toUpperCase()}{selNode.meta ? ` · ${selNode.meta}` : ""}</p>
              </div>
              <div>
                <p className="ops-kicker">DOWNSTREAM ({out.length})</p>
                <ul className="space-y-1">
                  {out.slice(0, 30).map((e, i) => (
                    <li key={i}>
                      <button className="ops-link" onClick={() => setSel(e.to)}>
                        {nodes.find((n) => n.id === e.to)?.label ?? e.to}
                      </button>
                      {e.rel ? <span className="text-[var(--ops-mute)]"> · {e.rel}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="ops-kicker">UPSTREAM ({inc.length})</p>
                <ul className="space-y-1">
                  {inc.slice(0, 30).map((e, i) => (
                    <li key={i}>
                      <button className="ops-link" onClick={() => setSel(e.from)}>
                        {nodes.find((n) => n.id === e.from)?.label ?? e.from}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export function EvidenceGraphBrowser() {
  const [q, setQ] = useState("");
  const [data, setData] = useState<{ nodes: GNode[]; edges: GEdge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async (term: string) => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`/api/ops/graph?q=${encodeURIComponent(term)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`graph api ${r.status}`);
      const d = (await r.json()) as { nodes: GNode[]; edges: GEdge[] };
      setData(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(""); }, []);

  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => { e.preventDefault(); void load(q); }}
      >
        <input
          aria-label="Search the evidence graph"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Buffett + Coca-Cola + 1988 — try: buffett, coca-cola, risk-management, 2008"
          className="border border-[var(--ops-rule)] bg-[var(--ops-card)] px-3 py-1.5 text-xs outline-none focus:border-[var(--ops-ink)]"
          style={{ minWidth: 320 }}
        />
        <button type="submit" className="ops-btn">SEARCH GRAPH</button>
        <span className="ops-kicker">default: the canonical documented chain (person → action → company → outcome)</span>
      </form>
      {loading && <p className="ops-kicker">LOADING…</p>}
      {err && <p className="ops-fail text-xs">{err}</p>}
      {data && !loading && (
        <GraphExplorer
          nodes={data.nodes}
          edges={data.edges}
          layers={["INVESTOR", "SOURCE", "POSITION_ACTION", "COMPANY", "THEME", "OUTCOME", "other"]}
        />
      )}
    </div>
  );
}

export function AckButton({ id, done }: { id: string; done: boolean }) {
  const [ok, setOk] = useState(done);
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="ops-btn-ghost"
      disabled={ok || busy}
      onClick={async () => {
        setBusy(true);
        try {
          const r = await fetch("/api/ops/issues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (r.ok) setOk(true);
        } finally {
          setBusy(false);
        }
      }}
    >
      {ok ? "ACKED" : busy ? "…" : "ACKNOWLEDGE"}
    </button>
  );
}

export function RefreshChecks() {
  const [checks, setChecks] = useState<{ id: string; label: string; status: string; detail: string; at: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async (all = false) => {
    setBusy(true);
    try {
      const r = await fetch(`/api/ops/health${all ? "" : ""}`, { cache: "no-store" });
      const d = (await r.json()) as { checks: typeof checks };
      setChecks(d.checks);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => { void run(true); }, []);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button className="ops-btn" onClick={() => void run(true)} disabled={busy}>
          {busy ? "RUNNING…" : "RUN ALL CHECKS"}
        </button>
        <span className="ops-kicker">live checks cached 5 min; build/tsc/tests from committed snapshot</span>
      </div>
      {checks && (
        <table className="ops-table">
          <thead>
            <tr><th>CHECK</th><th>STATUS</th><th>DETAIL</th><th>AT</th></tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.id}>
                <td className="font-semibold">{c.label}</td>
                <td><span className={`ops-dot ${c.status.toLowerCase()}`} aria-hidden />{c.status}</td>
                <td>{c.detail}</td>
                <td className="text-[var(--ops-mute)]">{String(c.at).slice(0, 19)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
