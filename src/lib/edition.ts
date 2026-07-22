import { getCollection, type CollectionEntry } from "astro:content";

export type ActiveEdition = CollectionEntry<"edicionActiva">["data"] & { slug: string };

export async function getActiveEdition(): Promise<ActiveEdition | null> {
  const entries = await getCollection("edicionActiva", (e) => e.data.activa);
  const entry = entries[0];
  return entry ? { ...entry.data, slug: entry.id } : null;
}

export async function getArchivedEditions() {
  const entries = await getCollection("edicionArchivo");
  return entries.sort((a, b) => a.data.orden - b.data.orden).map((e) => e.data);
}
