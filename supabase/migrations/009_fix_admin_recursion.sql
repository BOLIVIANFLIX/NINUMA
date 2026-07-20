-- NINUMÁ · arregla recursión infinita introducida por 008_admin_pedidos.sql.
-- Ejecutar una vez desde el SQL editor de Supabase, con URGENCIA: mientras no se
-- ejecute, NADIE puede leer su perfil (login/dashboard rotos para todos los clientes).
--
-- Causa: una policy de "profiles" que consulta "profiles" dentro de sí misma obliga a
-- Postgres a reevaluar esa misma policy una y otra vez (recursión). La solución estándar
-- es mover la comprobación a una función SECURITY DEFINER: al ejecutarse con privilegios
-- de propietario, la consulta interna a profiles no vuelve a pasar por RLS.

drop policy if exists "admin lee todos los perfiles" on profiles;
drop policy if exists "admin lee todos los pedidos" on orders;
drop policy if exists "admin actualiza cualquier pedido" on orders;

create or replace function public.is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin = true);
$$ language sql security definer stable set search_path = public;

create policy "admin lee todos los perfiles" on profiles
  for select using (public.is_admin());

create policy "admin lee todos los pedidos" on orders
  for select using (public.is_admin());

create policy "admin actualiza cualquier pedido" on orders
  for update using (public.is_admin());
