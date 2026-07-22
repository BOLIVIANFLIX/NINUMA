import { supabase, type Profile, type Order } from "./supabase";

const NOT_CONFIGURED_MSG = "El área de clientes no está disponible todavía. Inténtalo más tarde.";

function requireClient() {
  if (!supabase) throw new Error(NOT_CONFIGURED_MSG);
  return supabase;
}

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
}

export interface SignUpResult {
  /** Supabase, por defecto, exige confirmar el email antes de abrir sesión. */
  needsEmailConfirmation: boolean;
}

export async function signUp({ email, password, fullName }: SignUpParams): Promise<SignUpResult> {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return { needsEmailConfirmation: !data.session };
}

export async function signIn(email: string, password: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/cuenta/login/`,
  });
  if (error) throw error;
}

/** null si no hay sesión activa (o si Supabase no está configurado todavía). */
export async function getSessionProfile(): Promise<Profile | null> {
  if (!supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
  if (error) throw error;
  return data;
}

/** RLS limita el resultado a los pedidos del usuario autenticado. */
export async function getMyOrders(): Promise<Order[]> {
  const client = requireClient();
  const { data, error } = await client
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** account_type nunca cambia por aquí: el trigger pin_account_type_trigger lo fija
 * a su valor anterior en cada UPDATE (ver supabase/migrations/002_editar_perfil.sql),
 * así que ni falta ni serviría de nada incluirlo en patch. */
export async function updateMyProfile(patch: Partial<Pick<Profile, "full_name" | "phone" | "company_name">>): Promise<Profile> {
  const client = requireClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new Error(NOT_CONFIGURED_MSG);

  const { data, error } = await client.from("profiles").update(patch).eq("id", session.user.id).select().single();
  if (error) throw error;
  return data;
}
