/**
 * Register an agent run in the Control Room (AppConfig KV, ops:agent:*).
 * Usage:
 *   bun scripts/ops-log-agent.ts '{"agent":"AGENT 11","task":"Homepage v3","commit":"abc1234","files":18,"added":900,"removed":40,"tests":"PASS","build":"PASS","typecheck":"PASS","summary":"..."}'
 * Requires DATABASE_URL (run locally or in CI with env).
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("pass a JSON run record — see header");
    process.exit(1);
  }
  const rec = JSON.parse(arg) as Record<string, unknown>;
  const key = `ops:agent:${Date.now()}`;
  await db.appConfig.create({
    data: { key, value: JSON.stringify({ startedAt: new Date().toISOString(), ...rec }) },
  });
  console.log("registered", key);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
