-- NINUMÁ · área de clientes — plantillas de pedido recurrente (B2B). Ejecutar una vez desde
-- el SQL editor de Supabase. "Usar plantilla" solo pre-rellena el formulario de contacto: no
-- escribe en la tabla orders (los pedidos los sigue gestionando Ariadna a mano).

create table order_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  description text not null,
  kind text not null default 'b2b' check (kind in ('encargo','b2b')),
  created_at timestamptz not null default now()
);

alter table order_templates enable row level security;

create policy "own templates select" on order_templates for select using (auth.uid() = user_id);
create policy "own templates insert" on order_templates for insert with check (auth.uid() = user_id);
create policy "own templates update" on order_templates for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own templates delete" on order_templates for delete using (auth.uid() = user_id);
