export type TiendaCategoria = "tartas" | "bombones" | "postres";

/** Reclasificación SOLO para /tienda (tienda pública) — no toca /creaciones ni la
 * categoría pública de cada pieza en el resto del sitio. Mientras no haya piezas reales
 * de "postres", algunas se muestran aquí bajo esa pestaña con su foto y descripción
 * actuales. Sustituir por contenido real cuando esté listo. */
const CATEGORIA_TIENDA: Record<string, TiendaCategoria> = {
  "001": "tartas",
  "002": "tartas",
  "006": "tartas",
  "003": "bombones",
  "007": "bombones",
  "004": "postres",
  "005": "postres",
  "008": "postres",
};

export function categoriaTienda(numero: string): TiendaCategoria {
  return CATEGORIA_TIENDA[numero] ?? "tartas";
}
