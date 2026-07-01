# Marranito 🐷

Fondo de ahorro grupal (natillera / "vaca") con un **link público de solo lectura**
y una **zona de tesorería protegida con PIN**.

- **Público** (`/`): total ahorrado del ciclo, # de compañeros, # de aportes y
  movimientos confirmados. No expone comprobantes ni datos bancarios.
- **Tesorería** (`/admin`): registrar, confirmar y reversar aportes; gestionar
  compañeros. Protegida por PIN (server-side).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres) · pnpm.

Montos siempre en **pesos enteros** (COP, `bigint`), nunca floats. Libro
**append-only**: un aporte no se borra ni edita; un error se reversa con motivo.

## Arquitectura

Puerto `Store` (`lib/store/index.ts`) con dos adaptadores intercambiables:
- `SupabaseStore` (`pg`) — se usa cuando hay credenciales de Supabase.
- `LocalStore` (JSON) — fallback para desarrollo sin base.

La UI no sabe cuál está activo. Esquema SQL en `supabase/migrations/`.

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

| Variable | Descripción |
|---|---|
| `ADMIN_PIN` | PIN de la zona de tesorería |
| `ADMIN_SECRET` | Secreto para firmar la cookie de sesión |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública (anon) |
| `SUPABASE_PROJECT_REF` | Ref del proyecto |
| `SUPABASE_DB_PASSWORD` | Contraseña de la base de datos |
| `SUPABASE_DB_HOST` | Host del pooler (ej. `aws-1-us-west-2.pooler.supabase.com`) |
| `SUPABASE_DB_PORT` | Puerto del pooler (`5432` session) |

## Desarrollo

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

## Migraciones

```bash
node scripts/migrate.mjs   # aplica supabase/migrations/*.sql
```
