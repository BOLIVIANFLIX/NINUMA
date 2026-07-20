-- NINUMÁ · área de clientes — carrito B2B (pedido self-service). Ejecutar una vez desde el
-- SQL editor de Supabase. Permite a cada cliente crear SUS PROPIOS pedidos desde el carrito
-- de /cuenta/carrito. El estado queda fijado a 'recibido': el cliente no puede crear un
-- pedido ya "entregado", ni actualizarlo después (no hay política de UPDATE/DELETE para
-- clientes — Ariadna cambia el estado a mano en el Table Editor, como con los pedidos que
-- ella misma da de alta).

drop policy if exists "own orders insert" on orders;
create policy "own orders insert" on orders
  for insert with check (auth.uid() = user_id and status = 'recibido');
