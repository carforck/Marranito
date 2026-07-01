import { Pool } from "pg";

// Pool de Postgres hacia Supabase. Solo servidor.
// Usa el pooler de Supabase (apto para serverless/Vercel).

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  const ref = process.env.SUPABASE_PROJECT_REF;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const host =
    process.env.SUPABASE_DB_HOST ?? `aws-1-us-west-2.pooler.supabase.com`;
  const port = Number(process.env.SUPABASE_DB_PORT ?? 5432); // session pooler
  if (!ref || !password) {
    throw new Error("Faltan SUPABASE_PROJECT_REF / SUPABASE_DB_PASSWORD");
  }
  pool = new Pool({
    host,
    port,
    user: `postgres.${ref}`,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    max: 4,
  });
  return pool;
}

export function hasSupabase(): boolean {
  return Boolean(
    process.env.SUPABASE_PROJECT_REF && process.env.SUPABASE_DB_PASSWORD,
  );
}
