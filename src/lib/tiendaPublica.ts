import type { AlergenoId } from "./alergenos";

export interface TiendaPublicaItem {
  numero: string;
  nombre: string;
  imagen: string;
  href: string;
  categoria: string;
  precioPublico: number;
  alergenos: AlergenoId[];
  vegano: boolean;
  descripcionPublica: string | null;
}

let cache: Promise<TiendaPublicaItem[]> | null = null;

export function getTiendaPublicaCatalog(): Promise<TiendaPublicaItem[]> {
  if (!cache) {
    cache = fetch("/api/tienda-publica.json").then((res) => res.json());
  }
  return cache;
}
