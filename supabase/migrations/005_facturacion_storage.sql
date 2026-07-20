-- NINUMÁ · área de clientes — facturación (B2B). Ejecutar una vez desde el SQL editor de
-- Supabase. Ariadna sube cada PDF a mano desde Supabase Studio (usa la service role, que
-- salta RLS) bajo la ruta {user_id}/{nombre-archivo}.pdf — por eso solo hace falta una
-- policy de lectura: el cliente nunca escribe en este bucket desde la web.

insert into storage.buckets (id, name, public) values ('invoices', 'invoices', false);

create policy "own invoice files" on storage.objects
  for select using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);
