export interface PiezaCatalogItem {
  numero: string;
  nombre: string;
  imagen: string;
  href: string;
  materiales: string;
  categoria: string;
}

let cache: Promise<PiezaCatalogItem[]> | null = null;

/** Un único fetch por carga de página, reutilizado por favoritos y catálogo. */
export function getPiezasCatalog(): Promise<PiezaCatalogItem[]> {
  if (!cache) {
    cache = fetch("/api/piezas.json").then((res) => res.json());
  }
  return cache;
}
