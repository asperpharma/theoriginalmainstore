import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors } from "./_lib/cors";
import { supabaseAdmin } from "./_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const start = Date.now();

  // Ping Supabase with a lightweight query
  const { error: dbError } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true });

  const dbLatencyMs = Date.now() - start;
  const dbOk = !dbError;

  const status = dbOk ? "ok" : "degraded";
  const statusCode = dbOk ? 200 : 503;

  return res.status(statusCode).json({
    status,
    ts: new Date().toISOString(),
    services: {
      database: dbOk ? "ok" : `error: ${dbError?.message}`,
      dbLatencyMs,
    },
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  });
}
