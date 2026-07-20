import { supabase } from "./supabase";

const NOT_CONFIGURED_MSG = "El área de clientes no está disponible todavía. Inténtalo más tarde.";

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED_MSG);
  return supabase;
}

async function requireUserId(): Promise<string> {
  const client = requireClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new Error(NOT_CONFIGURED_MSG);
  return session.user.id;
}

/** Devuelve solo los números de pieza favoritos del usuario autenticado. */
export async function getMyFavorites(): Promise<string[]> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client.from("favorites").select("pieza_numero").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((f) => f.pieza_numero);
}

export async function addFavorite(piezaNumero: string): Promise<void> {
  const client = requireClient();
  const userId = await requireUserId();
  const { error } = await client.from("favorites").insert({ user_id: userId, pieza_numero: piezaNumero });
  // 23505 = unique_violation: ya era favorito (doble clic), no es un error real.
  if (error && error.code !== "23505") throw error;
}

export async function removeFavorite(piezaNumero: string): Promise<void> {
  const client = requireClient();
  const userId = await requireUserId();
  const { error } = await client.from("favorites").delete().eq("user_id", userId).eq("pieza_numero", piezaNumero);
  if (error) throw error;
}
