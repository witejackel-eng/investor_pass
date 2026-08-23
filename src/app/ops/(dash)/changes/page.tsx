export const dynamic = "force-dynamic";

// Recent changes straight from the public GitHub API (no tokens, no secrets).
type Commit = { sha: string; date: string; author: string; message: string };

export default async function OpsChanges() {
  let commits: Commit[] = [];
  let err: string | null = null;
  try {
    const r = await fetch(
      "https://api.github.com/repos/witejackel-eng/investor_pass/commits?per_page=15",
      { next: { revalidate: 300 } }
    );
    if (!r.ok) throw new Error(`github ${r.status}`);
    const data = (await r.json()) as {
      sha: string; commit: { message: string; author: { name: string; date: string } };
    }[];
    commits = data.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.commit.author?.name ?? "?",
      date: c.commit.author?.date ?? "",
    }));
  } catch (e) {
    err = e instanceof Error ? e.message : "failed";
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Changes — recent commits</h1>
        <p className="ops-kicker mt-1">GITHUB API (public repo) · CACHED 5 MIN · WHAT EACH AGENT RELEASE CHANGED</p>
      </div>
      {err && <p className="ops-warn text-sm">GitHub unavailable: {err}</p>}
      <div className="ops-card overflow-auto" style={{ maxHeight: 640 }}>
        <table className="ops-table">
          <thead>
            <tr><th>COMMIT</th><th>MESSAGE</th><th>AUTHOR</th><th>DATE</th></tr>
          </thead>
          <tbody>
            {commits.map((c) => (
              <tr key={c.sha}>
                <td className="ops-blue font-bold">{c.sha}</td>
                <td>{c.message}</td>
                <td className="text-[var(--ops-mute)]">{c.author}</td>
                <td className="text-[var(--ops-mute)]">{c.date.slice(0, 19).replace("T", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
