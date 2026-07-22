-- NINUMÁ · tienda pública con pago real (Stripe) — tienda y ediciones especiales.
-- Ejecutar una vez desde el SQL editor de Supabase.
--
-- Los pedidos de /tienda/ y /ediciones-especiales/ pueden venir de un invitado (sin
-- cuenta, solo email/teléfono capturados por el propio Stripe Checkout) o de un cliente
-- con perfil (user_id, para que aparezca en "Tus pedidos"). Por eso user_id pasa a ser
-- opcional, con un check que exige uno de los dos.
--
-- A diferencia de los pedidos B2B/encargo (sin pago, solo registro), estos SÍ llevan un
-- pago real: no hay política de INSERT para clientes en orders/order_items — solo el
-- webhook de Stripe (con la service/secret key, que salta RLS) los crea, y solo después
-- de que Stripe confirme el pago. Así ningún cliente puede insertarse desde el navegador
-- un pedido marcado como pagado.

alter table orders alter column user_id drop not null;

alter table orders drop constraint orders_kind_check;
alter table orders add constraint orders_kind_check check (kind in ('encargo', 'b2b', 'tienda', 'edicion'));

alter table orders add column guest_nombre text;
alter table orders add column guest_email text;
alter table orders add column guest_telefono text;
alter table orders add column total_cents integer;
alter table orders add column payment_status text not null default 'pendiente'
  check (payment_status in ('pendiente', 'pagado', 'fallido', 'reembolsado'));
alter table orders add column stripe_checkout_session_id text unique;
alter table orders add column stripe_payment_intent_id text;

alter table orders add constraint orders_user_o_guest_check
  check (user_id is not null or guest_email is not null);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  referencia text not null, -- número de pieza ("003"), o "edicion-slug:caja-6"
  nombre text not null,
  precio_unitario_cents integer not null check (precio_unitario_cents >= 0),
  unidades integer not null check (unidades > 0),
  created_at timestamptz not null default now()
);

alter table order_items enable row level security;

create policy "own order items select" on order_items
  for select using (exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid()));

create policy "admin lee todas las lineas de pedido" on order_items
  for select using (public.is_admin());

-- Limpieza de reglas que este mismo cambio deja obsoletas/insuficientes:

-- 1) "own orders insert" (006_pedidos_selfservice.sql) solo comprobaba
--    "auth.uid() = user_id and status = 'recibido'", sin restringir "kind". Mientras
--    solo existía kind='b2b' era inofensivo; ahora que existen 'tienda'/'edicion' hay
--    que atarla explícitamente a 'b2b' — si no, cualquier cliente logueado podría
--    insertarse desde el navegador un pedido falso de tipo tienda/edicion (sin pagar,
--    pero ensuciando la tabla y "Tus pedidos"). Los pedidos de tienda/edicion SOLO
--    los crea el webhook de Stripe con la secret key, que salta RLS.
drop policy if exists "own orders insert" on orders;
create policy "own orders insert" on orders
  for insert with check (auth.uid() = user_id and status = 'recibido' and kind = 'b2b');

-- 2) "orders_con_nombre" (010_vistas_con_nombre.sql) usaba un INNER JOIN con profiles:
--    en cuanto user_id admite null (pedidos de invitado, más arriba en esta misma
--    migración) esos pedidos desaparecerían silenciosamente de la vista. Se recrea con
--    LEFT JOIN y se usa guest_nombre como último recurso. Se dropea en vez de "or
--    replace" porque el nuevo orders.* trae columnas de más en medio, lo que Postgres
--    no permite con CREATE OR REPLACE VIEW (solo deja añadir columnas al final).
drop view if exists orders_con_nombre;
create view orders_con_nombre with (security_invoker = true) as
select o.*, coalesce(p.company_name, p.full_name, o.guest_nombre, 'Invitado') as cliente_nombre
from orders o
left join profiles p on p.id = o.user_id
order by o.created_at desc;
