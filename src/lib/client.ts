/**
 * Client-side API helpers. All requests use relative paths (gateway-safe).
 */
export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function apiPost<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `${res.status} ${res.statusText}`);
  return data as T;
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(path, { method: "DELETE", credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `${res.status} ${res.statusText}`);
  return data as T;
}

/** Fire-and-forget product analytics (spec section 45-46). Never throws. */
export function track(name: string, props?: Record<string, unknown>) {
  try {
    void fetch("/api/events", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, props }),
      keepalive: true,
    });
  } catch {}
}
