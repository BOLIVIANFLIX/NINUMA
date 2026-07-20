-- NINUMÁ · área de clientes — precios B2B pactados por cliente. Ejecutar una vez desde el
-- SQL editor de Supabase. Sustituye el precio B2B único por producto: cada cliente puede
-- tener un precio distinto para el mismo producto, negociado con Ariadna.
--
-- Ariadna rellena esta tabla a mano desde el Table Editor: una fila por cliente + producto
-- con el precio pactado. pieza_numero debe coincidir con el campo "numero" de
-- src/content/piezas (ej. "001", "005"). Un producto solo aparece en el catálogo de un
-- cliente si existe una fila aquí para ese cliente — no hay lista "por defecto".

create table b2b_prices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pieza_numero text not null,
  precio numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, pieza_numero)
);

alter table b2b_prices enable row level security;

-- Solo lectura para el propio cliente: la escritura la hace Ariadna con la service role
-- (Table Editor), que salta RLS. Ningún cliente puede fijar ni ver su propio precio.
create policy "own b2b prices select" on b2b_prices for select using (auth.uid() = user_id);
