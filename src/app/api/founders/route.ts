import { NextResponse } from "next/server";
import { getFounderDirectory } from "@/lib/server/public-pages";

export const dynamic = "force-dynamic";

// GET /api/founders — public founder directory (Person rows where
// kind="founder"). Powers the homepage FoundersFeature client section and
// any other surface that wants the founder roster live from the DB.
//
// Mirrors /api/investors: session-independent public data, safe to cache at
// the edge + in browsers. Returns { founders: DirectoryEntry[] }.
export async function GET() {
  const founders = (await getFounderDirectory()) ?? [];
  return NextResponse.json(
    { founders },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
