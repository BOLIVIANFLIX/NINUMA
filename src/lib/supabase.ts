import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/** Clave pública (anon): segura de exponer en el cliente. La seguridad real
 * la dan las políticas RLS de supabase/schema.sql, no el ocultamiento de esta clave.
 *
 * null mientras PUBLIC_SUPABASE_URL/PUBLIC_SUPABASE_ANON_KEY no estén configuradas
 * (ver .env.example), para que el resto del sitio (p.ej. Header.astro) no se rompa
 * antes de tener un proyecto Supabase creado. */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export type AccountType = "b2c" | "b2b";

export interface Profile {
  id: string;
  account_type: AccountType;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  created_at: string;
}

export type OrderKind = "encargo" | "b2b";
export type OrderStatus = "recibido" | "en_obrador" | "listo" | "entregado";

export interface Order {
  id: string;
  user_id: string;
  kind: OrderKind;
  description: string;
  status: OrderStatus;
  created_at: string;
}
