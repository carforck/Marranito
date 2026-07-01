import pg, { Pool } from "pg";

// La columna `fecha` es tipo DATE (OID 1082). Por defecto node-pg la
// convierte a un objeto Date (con desfase de zona horaria); la queremos
// como string "YYYY-MM-DD" tal cual viene de Postgres.
pg.types.setTypeParser(1082, (v) => v);

// Pool de Postgres hacia Supabase. Solo servidor.
// Usa el pooler de Supabase (apto para serverless/Vercel).

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  const ref = process.env.SUPABASE_PROJECT_REF;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const host =
    process.env.SUPABASE_DB_HOST ?? `aws-1-us-west-2.pooler.supabase.com`;
  // Pooler en modo TRANSACCIÓN (6543): apto para serverless, muchas
  // conexiones cortas. El modo sesión (5432) se agota a 15 clientes.
  const port = Number(process.env.SUPABASE_DB_PORT ?? 6543);
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
    max: 3,
    idleTimeoutMillis: 10_000, // libera conexiones ociosas
  });
  return pool;
}

export function hasSupabase(): boolean {
  return Boolean(
    process.env.SUPABASE_PROJECT_REF && process.env.SUPABASE_DB_PASSWORD,
  );
}
