-- NINUMÁ · área de clientes — favoritos. Ejecutar una vez desde el SQL editor de Supabase.
-- pieza_numero referencia el campo "numero" de la colección de contenido src/content/piezas
-- (no puede ser una FK real: esa colección no vive en la base de datos).

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pieza_numero text not null,
  created_at timestamptz not null default now(),
  unique (user_id, pieza_numero)
);

alter table favorites enable row level security;

create policy "own favorites select" on favorites for select using (auth.uid() = user_id);
create policy "own favorites insert" on favorites for insert with check (auth.uid() = user_id);
create policy "own favorites delete" on favorites for delete using (auth.uid() = user_id);
