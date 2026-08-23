const SITE_URL = process.env.PUBLIC_SITE_URL || "https://investorpass.vercel.app";

export type JsonLdNode = Record<string, unknown>;
export type CrumbItem = { label: string; href?: string };

export function siteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function breadcrumbLd(items: CrumbItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(i < items.length - 1 && item.href ? { item: siteUrl(item.href) } : {}),
    })),
  };
}

export function entityJsonld(
  type: "Person" | "WebPage" | "Event",
  fields: {
    name: string;
    path: string;
    description?: string | null;
    about?: string | null;
    startDate?: string | null;
  }
): JsonLdNode {
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": type,
    name: fields.name,
    url: siteUrl(fields.path),
  };
  if (fields.description) node.description = fields.description;
  if (fields.about) node.about = { "@type": "Thing", name: fields.about };
  if (fields.startDate) node.startDate = fields.startDate;
  return node;
}

/** Accepts only unambiguous ISO-8601 date strings (YYYY, YYYY-MM, YYYY-MM-DD). */
export function asIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  return /^\d{4}(-\d{2}){0,2}$/.test(v) ? v : null;
}

function stripContext(node: JsonLdNode): JsonLdNode {
  const copy = { ...node };
  delete copy["@context"];
  return copy;
}

export function graphLd(nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes.map(stripContext) };
}

export function serializeJsonLd(nodes: JsonLdNode[]): string {
  return JSON.stringify(graphLd(nodes)).replace(/</g, "\\u003c");
}
