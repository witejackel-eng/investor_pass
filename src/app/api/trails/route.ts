import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import trailsJson from "@/data/trails/trails.json";
import type { Trail, TrailEntityKind, TrailNode } from "@/components/investor/views-trails";

export const dynamic = "force-dynamic";

const trails = trailsJson as Trail[];

type EnrichedNode = TrailNode & { refCount: number };

async function refCount(kind: TrailEntityKind, slug: string): Promise<number> {
  switch (kind) {
    case "source":
      return db.passage.count({ where: { source: { slug } } });
    case "theme":
      return db.passageTheme.count({ where: { theme: { slug } } });
    case "company":
      return db.passageCompany.count({ where: { company: { slug } } });
    case "event":
      return db.passageEvent.count({ where: { event: { slug } } });
    case "concept":
      return db.passageConcept.count({ where: { concept: { slug } } });
    case "person":
      return db.source.count({ where: { person: { slug } } });
    default:
      return 0;
  }
}

export async function GET() {
  try {
    const enriched = await Promise.all(
      trails.map(async (trail) => ({
        ...trail,
        nodes: (await Promise.all(
          trail.nodes.map(async (node) => ({ ...node, refCount: await refCount(node.entityKind, node.entitySlug) }))
        )) as EnrichedNode[],
      }))
    );
    return json({ trails: enriched });
  } catch {
    return error("Trails are temporarily unavailable", 500);
  }
}
