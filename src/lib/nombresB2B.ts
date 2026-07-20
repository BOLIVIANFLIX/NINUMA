/** Nombres internos (estilo ficha de producción) que ve el cliente B2B en el catálogo,
 * distintos del nombre artístico que ve el público en /creaciones. Misma pieza (mismo
 * numero, misma foto, mismo precio pactado en b2b_prices), solo cambia la etiqueta.
 * Edita este mapa para renombrar o añadir piezas nuevas al catálogo B2B. */
const NOMBRES_B2B: Record<string, string> = {
  "001": "Choco Dubai",
  "002": "Creme brulee",
  "003": "Lata de Chocolate",
  "004": "Milhojas",
  "005": "SC Cheese",
  "006": "SC Choco",
  "007": "SC Oreo",
  "008": "SC Pistacho",
};

export function nombreB2B(numero: string, nombreOriginal: string): string {
  return NOMBRES_B2B[numero] ?? nombreOriginal;
}
