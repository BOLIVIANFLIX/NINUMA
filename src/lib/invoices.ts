import { supabase } from "./supabase";

const NOT_CONFIGURED_MSG = "El área de clientes no está disponible todavía. Inténtalo más tarde.";
const BUCKET = "invoices";

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

export interface InvoiceFile {
  name: string;
  path: string;
  createdAt: string | null;
}

/** Ariadna sube cada factura a {user_id}/{nombre}.pdf desde Supabase Studio (service role);
 * aquí solo se listan y descargan, nunca se suben desde la web. */
export async function listMyInvoices(): Promise<InvoiceFile[]> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client.storage.from(BUCKET).list(userId, { sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  return (data ?? [])
    .filter((f) => f.id !== null) // descarta "placeholder" de carpeta vacía
    .map((f) => ({ name: f.name, path: `${userId}/${f.name}`, createdAt: f.created_at ?? null }));
}

export async function getInvoiceDownloadUrl(path: string): Promise<string> {
  const client = requireClient();
  const { data, error } = await client.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
