-- NINUMÁ · área de clientes — editar perfil. Ejecutar una vez desde el SQL editor de Supabase.
-- Permite a cada cliente actualizar su propio perfil (nombre, teléfono, empresa) sin poder
-- autoascenderse de b2c a b2b: un trigger BEFORE UPDATE fuerza account_type de vuelta a su
-- valor anterior pase lo que pase en el payload, así que la policy de UPDATE puede ser abierta.

create or replace function public.pin_account_type() returns trigger as $$
begin
  new.account_type := old.account_type;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists pin_account_type_trigger on profiles;
create trigger pin_account_type_trigger
  before update on profiles
  for each row execute procedure public.pin_account_type();

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
