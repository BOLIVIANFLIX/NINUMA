-- NINUMÁ · panel de administración de pedidos. Ejecutar una vez desde el SQL editor de
-- Supabase. Añade un rol "admin" (solo Ariadna) que puede ver todos los perfiles y
-- pedidos, y cambiar el estado de cualquier pedido, sin poder saltarse el resto de RLS.

alter table profiles add column is_admin boolean not null default false;

-- Nota de seguridad: esta subconsulta sobre profiles dentro de su propia policy no crea
-- recursión infinita porque siempre hay al menos la policy "own profile" (select) que
-- permite a cada usuario leerse a sí mismo — es el patrón estándar de Supabase para roles.
create policy "admin lee todos los perfiles" on profiles
  for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "admin lee todos los pedidos" on orders
  for select using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "admin actualiza cualquier pedido" on orders
  for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- Después de ejecutar esto, marca tu propia fila como admin desde el Table Editor:
-- tabla profiles -> busca tu fila -> pon is_admin a true.
