// Corre las migraciones SQL contra Supabase usando la conexión directa de Postgres.
// Lee credenciales de .env.local. No imprime la contraseña.
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// Mini-parser de .env.local
const env = {};
for (const line of readFileSync(path.join(root, ".env.local"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const ref = env.SUPABASE_PROJECT_REF;
const password = env.SUPABASE_DB_PASSWORD;
if (!ref || !password) {
  console.error("Faltan SUPABASE_PROJECT_REF o SUPABASE_DB_PASSWORD en .env.local");
  process.exit(1);
}

// Región us-west-2 → pooler. Probamos varios hosts/puertos por compatibilidad.
const candidates = [
  { host: "aws-0-us-west-2.pooler.supabase.com", port: 5432 },
  { host: "aws-1-us-west-2.pooler.supabase.com", port: 5432 },
  { host: "aws-0-us-west-2.pooler.supabase.com", port: 6543 },
  { host: `db.${ref}.supabase.co`, port: 5432 },
];

const sqlDir = path.join(root, "supabase", "migrations");
const files = readdirSync(sqlDir).filter((f) => f.endsWith(".sql")).sort();

async function tryConnect(c) {
  const client = new pg.Client({
    host: c.host,
    port: c.port,
    user: `postgres.${ref}`,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  return client;
}

let client = null;
for (const c of candidates) {
  try {
    client = await tryConnect(c);
    console.log(`Conectado vía ${c.host}:${c.port}`);
    break;
  } catch (e) {
    console.log(`  ✗ ${c.host}:${c.port} → ${e.code || e.message}`);
  }
}
if (!client) {
  console.error("No se pudo conectar a Postgres por ninguna ruta.");
  process.exit(2);
}

try {
  for (const f of files) {
    const sql = readFileSync(path.join(sqlDir, f), "utf-8");
    console.log(`Aplicando ${f}…`);
    await client.query(sql);
    console.log(`  ✓ ${f}`);
  }
  // Verificación
  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name"
  );
  console.log("Tablas en public:", rows.map((r) => r.table_name).join(", "));
} finally {
  await client.end();
}
