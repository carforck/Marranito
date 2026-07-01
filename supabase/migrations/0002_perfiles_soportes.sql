-- Marranito · perfiles de compañero, detalle de aportes y soportes.

-- Compañeros: emoji de avatar + color propio (para gráficas y perfil).
alter table public.miembros add column if not exists emoji text not null default '🐷';
alter table public.miembros add column if not exists color text not null default '#6c5ce7';

-- Aportes: descripción, método de pago y soporte (captura).
alter table public.aportes add column if not exists descripcion text;
alter table public.aportes add column if not exists metodo text
  check (metodo in ('efectivo','nequi','bancolombia','daviplata','otro'));
alter table public.aportes add column if not exists soporte_url text;

-- ─────────────────────────────────────────────────────────────
-- Storage: bucket público "soportes" para las capturas.
-- Lectura pública (transparencia); inserción permitida a anon
-- (cada quien sube su comprobante). Sin borrado para anon.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('soportes', 'soportes', true)
on conflict (id) do update set public = true;

drop policy if exists "soportes lectura publica" on storage.objects;
create policy "soportes lectura publica" on storage.objects
  for select using (bucket_id = 'soportes');

drop policy if exists "soportes subida anon" on storage.objects;
create policy "soportes subida anon" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'soportes');
