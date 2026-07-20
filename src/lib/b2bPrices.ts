import { supabase, type B2BPrice } from "./supabase";

const NOT_CONFIGURED_MSG = "El área de clientes no está disponible todavía. Inténtalo más tarde.";

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED_MSG);
  return supabase;
}

/** Solo devuelve las filas que Ariadna ha pactado con el usuario autenticado
 * (tabla b2b_prices, rellenada a mano desde Supabase — ver migrations/007). */
export async function getMyB2BPrices(): Promise<Pick<B2BPrice, "pieza_numero" | "precio">[]> {
  const client = requireClient();
  const { data, error } = await client.from("b2b_prices").select("pieza_numero, precio");
  if (error) throw error;
  return data ?? [];
}
