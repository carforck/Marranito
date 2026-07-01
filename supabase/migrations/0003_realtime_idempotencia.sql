-- Marranito · idempotencia de aportes + realtime.

-- Idempotencia: un token único por envío evita aportes duplicados
-- (doble clic, reintentos). Los nulos son distintos entre sí, así que
-- los aportes creados por el tesorero (sin token) no chocan.
alter table public.aportes add column if not exists client_token uuid;
create unique index if not exists aportes_client_token_key
  on public.aportes(client_token);

-- Transparencia total: anon puede leer todos los aportes (ya se muestran
-- en /movimientos). Necesario para que Realtime entregue los cambios.
drop policy if exists "lectura publica aportes confirmados" on public.aportes;
drop policy if exists "lectura publica aportes" on public.aportes;
create policy "lectura publica aportes" on public.aportes
  for select to anon using (true);

-- Publicación de Realtime para reflejar cambios en vivo.
do $$ begin
  alter publication supabase_realtime add table public.aportes;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.miembros;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.ciclos;
exception when duplicate_object then null; end $$;
