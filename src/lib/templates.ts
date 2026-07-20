import { supabase, type OrderTemplate } from "./supabase";

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

export async function getMyTemplates(): Promise<OrderTemplate[]> {
  const client = requireClient();
  const { data, error } = await client.from("order_templates").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface CreateTemplateInput {
  label: string;
  description: string;
}

export async function createTemplate(input: CreateTemplateInput): Promise<OrderTemplate> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client
    .from("order_templates")
    .insert({ user_id: userId, label: input.label, description: input.description, kind: "b2b" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  const client = requireClient();
  const { error } = await client.from("order_templates").delete().eq("id", id);
  if (error) throw error;
}
