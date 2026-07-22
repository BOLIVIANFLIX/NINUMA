import { getCollection, type CollectionEntry } from "astro:content";

type EdicionData = CollectionEntry<"ediciones">["data"];
export type EdicionActiva = Extract<EdicionData, { estado: "activa" }> & { slug: string };
export type EdicionCerrada = Extract<EdicionData, { estado: "cerrada" }> & { slug: string };

/** Solo puede haber una edición activa a la vez (la que acepta compra real,
 * ver crear-sesion-pago.ts) — si hay varias marcadas "activa" por error de
 * contenido, se usa la primera y las demás se ignoran silenciosamente. */
export async function getActiveEdition(): Promise<EdicionActiva | null> {
  const entries = await getCollection("ediciones", (e) => e.data.estado === "activa");
  const entry = entries[0];
  if (!entry || entry.data.estado !== "activa") return null;
  return { ...entry.data, slug: entry.id };
}

/** Ediciones cerradas: cada una tiene página propia permanente en
 * /ediciones-especiales/[slug]/ (ver esa ruta) — así lo que ya se vendió y
 * cerró sigue indexado como parte del historial, en vez de perderse. */
export async function getArchivedEditions(): Promise<EdicionCerrada[]> {
  const entries = await getCollection("ediciones", (e) => e.data.estado === "cerrada");
  return entries
    .filter((e): e is typeof e & { data: Extract<EdicionData, { estado: "cerrada" }> } => e.data.estado === "cerrada")
    .sort((a, b) => a.data.orden - b.data.orden)
    .map((e) => ({ ...e.data, slug: e.id }));
}

export async function getArchivedEditionBySlug(slug: string): Promise<EdicionCerrada | null> {
  const archived = await getArchivedEditions();
  return archived.find((e) => e.slug === slug) ?? null;
}
