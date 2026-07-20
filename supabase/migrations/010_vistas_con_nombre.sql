-- NINUMÁ · vistas de solo lectura para monitorizar más fácil desde Supabase: muestran el
-- nombre del cliente en vez de su user_id (UUID). Ejecutar una vez desde el SQL editor.
--
-- "security_invoker = true" es importante: hace que cada vista respete las mismas
-- políticas RLS que la tabla real, en vez de mostrar todo a cualquiera que la consulte.
-- Como resultado: tú (admin) ves todas las filas con nombre; un cliente normal, si
-- consultara la vista, seguiría viendo solo lo suyo — igual que con las tablas originales.
--
-- Son solo para consulta/monitorización. Para editar (p.ej. el precio de un producto o el
-- estado de un pedido), sigue usando las tablas reales (orders, b2b_prices...) como hasta
-- ahora, o el panel /cuenta/admin/pedidos para el estado de los pedidos.

create view orders_con_nombre with (security_invoker = true) as
select o.*, coalesce(p.company_name, p.full_name) as cliente_nombre
from orders o
join profiles p on p.id = o.user_id
order by o.created_at desc;

create view b2b_prices_con_nombre with (security_invoker = true) as
select b.*, coalesce(p.company_name, p.full_name) as cliente_nombre
from b2b_prices b
join profiles p on p.id = b.user_id
order by cliente_nombre, b.pieza_numero;

create view favoritos_con_nombre with (security_invoker = true) as
select f.*, coalesce(p.company_name, p.full_name) as cliente_nombre
from favorites f
join profiles p on p.id = f.user_id;

create view plantillas_con_nombre with (security_invoker = true) as
select t.*, coalesce(p.company_name, p.full_name) as cliente_nombre
from order_templates t
join profiles p on p.id = t.user_id;
