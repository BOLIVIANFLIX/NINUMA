import type { AlergenoId } from "./alergenos";

export interface PiezaCatalogItem {
  numero: string;
  nombre: string;
  imagen: string;
  href: string;
  materiales: string;
  categoria: string;
  // Ficha técnica B2B — ver src/pages/cuenta/catalogo.astro.
  alergenos: AlergenoId[];
  caloriasAprox: number | null;
  caducidadDias: number | null;
  notasTecnicas: string | null;
}

let cache: Promise<PiezaCatalogItem[]> | null = null;

/** Un único fetch por carga de página, reutilizado por favoritos y catálogo. */
export function getPiezasCatalog(): Promise<PiezaCatalogItem[]> {
  if (!cache) {
    cache = fetch("/api/piezas.json").then((res) => res.json());
  }
  return cache;
}
