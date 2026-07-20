-- NINUMÁ · área de clientes (v1) — ejecutar una vez desde el SQL editor de Supabase.
-- Ver plan: login + perfil + tipo de cuenta (b2b/b2c) + historial de pedidos de solo lectura.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('b2c','b2b')) default 'b2c',
  full_name text not null,
  phone text,
  company_name text,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('encargo','b2b')),
  description text not null,
  status text not null default 'recibido' check (status in ('recibido','en_obrador','listo','entregado')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table orders enable row level security;

create policy "own profile" on profiles for select using (auth.uid() = id);
create policy "own orders" on orders for select using (auth.uid() = user_id);

-- Sin política de UPDATE en v1 a propósito: el dashboard no ofrece editar el
-- perfil todavía, y una política "for update using (auth.uid() = id)" sin
-- "with check" dejaría que cualquier cliente se autoasignara account_type='b2b'
-- (o cambiara company_name) llamando directamente a la API de Supabase, sin
-- pasar por ninguna pantalla. Cuando se construya "editar perfil", añadir una
-- política de UPDATE con with check que fije account_type/company_name a su
-- valor anterior (o una función RPC dedicada), nunca un UPDATE abierto.

-- Auto-crea el perfil (b2c por defecto) al registrarse. Ariadna cambia a
-- account_type='b2b' + company_name a mano en el Table Editor cuando da de
-- alta un cliente mayorista (ver README de la sección /cuenta).
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
