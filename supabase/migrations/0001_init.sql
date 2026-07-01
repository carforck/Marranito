-- Marranito · esquema inicial
-- Montos SIEMPRE en pesos enteros (bigint). Nunca floats/decimales.

create extension if not exists "pgcrypto";

-- Ciclos de ahorro (enero–diciembre, se liquidan a fin de año).
create table if not exists public.ciclos (
  id uuid primary key default gen_random_uuid(),
  anio int not null unique,
  meta_por_miembro bigint,            -- meta opcional por persona (pesos)
  abierto boolean not null default true,
  created_at timestamptz not null default now()
);

-- Compañeros del fondo.
create table if not exists public.miembros (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz not null default now()
);

-- Aportes. Libro append-only: no se borra; un error se reversa con motivo.
create table if not exists public.aportes (
  id uuid primary key default gen_random_uuid(),
  miembro_id uuid not null references public.miembros(id),
  ciclo_id uuid references public.ciclos(id),
  monto bigint not null check (monto > 0),     -- pesos enteros
  fecha date not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','confirmado','reversado')),
  nota text,                                    -- motivo de reversa
  created_at timestamptz not null default now()
);

create index if not exists aportes_estado_idx on public.aportes(estado);
create index if not exists aportes_miembro_idx on public.aportes(miembro_id);

-- Ciclo del año en curso.
insert into public.ciclos (anio, abierto)
values (2026, true)
on conflict (anio) do nothing;

-- ─────────────────────────────────────────────────────────────
-- RLS: por defecto nadie entra por la API pública.
-- El backend (Server Actions) accede con el rol postgres y omite RLS.
-- Dejamos lectura pública SOLO de lo no sensible, por si algún día
-- se consume con la anon key desde el cliente.
-- ─────────────────────────────────────────────────────────────
alter table public.ciclos   enable row level security;
alter table public.miembros enable row level security;
alter table public.aportes  enable row level security;

drop policy if exists "lectura publica ciclos" on public.ciclos;
create policy "lectura publica ciclos" on public.ciclos
  for select to anon using (true);

drop policy if exists "lectura publica miembros" on public.miembros;
create policy "lectura publica miembros" on public.miembros
  for select to anon using (true);

-- El público solo ve aportes CONFIRMADOS (nada pendiente ni reversado).
drop policy if exists "lectura publica aportes confirmados" on public.aportes;
create policy "lectura publica aportes confirmados" on public.aportes
  for select to anon using (estado = 'confirmado');

-- Sin políticas de insert/update/delete para anon => escritura bloqueada por API.
