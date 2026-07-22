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
  "009": "postres",
  "012": "postres",
  "013": "postres",
  "014": "postres",
  "015": "postres",
  "016": "postres",
  "017": "bombones",
  "018": "bombones",
  "019": "bombones",
  "020": "bombones",
  "021": "bombones",
  "022": "tartas",
  "023": "tartas",
  "024": "tartas",
  "025": "tartas",
};

export function categoriaTienda(numero: string): TiendaCategoria {
  return CATEGORIA_TIENDA[numero] ?? "tartas";
}
