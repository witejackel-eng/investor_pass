import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

const DOCS = [
  "PRODUCT_CONSTITUTION.md", "EVIDENCE_AND_RIGHTS_POLICY.md", "DATA_MODEL.md",
  "REPOSITORY_AUDIT.md", "IMPLEMENTATION.md", "CURRENT_STATE.md",
  "FEATURE_MATRIX.md", "CHANGELOG.md", "ROUTES.md", "ARCHITECTURE.md",
  "DATA_QUALITY_REPORT.md", "OPS_DASHBOARD.md", "payments-spec.md", "GRAPHIFY_REPORT.md", "PRODUCTION_ACCEPTANCE.md",
];

// Render a chosen internal doc as pre-wrapped text (private browser).
export default async function OpsDocs({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const file = DOCS.includes(f ?? "") ? f! : DOCS[0];
  let body = "";
  let err = false;
  try {
    body = await readFile(join(process.cwd(), "docs", file), "utf8");
  } catch {
    err = true;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Docs — internal browser</h1>
        <p className="ops-kicker mt-1">READS FROM THE DEPLOYED docs/ FOLDER · PRIVATE</p>
      </div>
      <nav className="flex flex-wrap gap-2" aria-label="Documents">
        {DOCS.map((d) => (
          <a
            key={d}
            href={`/ops/docs?f=${d}`}
            className="border px-2 py-1 text-[0.68rem]"
            style={{ borderColor: d === file ? "var(--ops-blue)" : "var(--ops-rule)", fontWeight: d === file ? 700 : 400 }}
          >
            {d}
          </a>
        ))}
      </nav>
      <div className="ops-card overflow-auto" style={{ maxHeight: 640 }}>
        {err ? (
          <p className="ops-warn text-xs">{file} not found in this deployment.</p>
        ) : (
          <pre className="whitespace-pre-wrap break-words text-[0.72rem] leading-relaxed">{body}</pre>
        )}
      </div>
    </div>
  );
}
