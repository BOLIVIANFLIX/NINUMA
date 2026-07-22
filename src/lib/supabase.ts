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
  is_admin: boolean;
}

export type OrderKind = "encargo" | "b2b" | "tienda" | "edicion";
export type OrderStatus = "recibido" | "en_obrador" | "listo" | "entregado";
export type PaymentStatus = "pendiente" | "pagado" | "fallido" | "reembolsado";

export interface Order {
  id: string;
  user_id: string | null;
  kind: OrderKind;
  description: string;
  status: OrderStatus;
  created_at: string;
  guest_nombre: string | null;
  guest_email: string | null;
  guest_telefono: string | null;
  total_cents: number | null;
  payment_status: PaymentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  referencia: string;
  nombre: string;
  precio_unitario_cents: number;
  unidades: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  pieza_numero: string;
  created_at: string;
}

export interface OrderTemplate {
  id: string;
  user_id: string;
  label: string;
  description: string;
  kind: OrderKind;
  created_at: string;
}

export interface B2BPrice {
  id: string;
  user_id: string;
  pieza_numero: string;
  precio: number;
  created_at: string;
}
