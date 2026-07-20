import { supabase, type Order, type OrderStatus } from "./supabase";

const NOT_CONFIGURED_MSG = "El área de clientes no está disponible todavía. Inténtalo más tarde.";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjgqwdye";

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED_MSG);
  return supabase;
}

/** El estado queda en 'recibido' por defecto (columna) y la RLS de
 * supabase/migrations/006_pedidos_selfservice.sql lo exige explícitamente:
 * un cliente nunca puede crear un pedido con otro estado. */
export async function createOrder(description: string): Promise<Order> {
  const client = requireClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new Error(NOT_CONFIGURED_MSG);

  const { data, error } = await client
    .from("orders")
    .insert({ user_id: session.user.id, kind: "b2b", description })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export interface OrderWithCliente extends Order {
  cliente_nombre: string;
}

/** Solo devuelve resultados si el usuario autenticado es admin (ver RLS en
 * supabase/migrations/008_admin_pedidos.sql); para cualquier otro usuario, RLS
 * limita esto a sus propios pedidos igual que getMyOrders(). */
export async function getAllOrdersForAdmin(): Promise<OrderWithCliente[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("orders")
    .select("*, profiles(full_name, company_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => {
    const { profiles, ...order } = row as Order & { profiles: { full_name: string; company_name: string | null } | null };
    return { ...order, cliente_nombre: profiles?.company_name || profiles?.full_name || "Cliente" };
  });
}

/** Solo un admin puede actualizar el pedido de otro cliente (ver RLS en
 * supabase/migrations/008_admin_pedidos.sql) — para cualquier otro usuario, RLS rechaza
 * el UPDATE porque no hay política que se lo permita. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
}

export interface OrderEmailParams {
  nombre: string;
  email: string;
  telefono: string | null;
  descripcion: string;
}

/** Mismo endpoint de Formspree que usa /contacto — así el pedido llega al correo de
 * Ariadna con el mismo formato que ya conoce, sin que el cliente pase por esa página. */
export async function notifyOrderByEmail(params: OrderEmailParams): Promise<Response> {
  return fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: params.nombre,
      email: params.email,
      telefono: params.telefono ?? "",
      tipo: "b2b",
      descripcion: params.descripcion,
    }),
  });
}
