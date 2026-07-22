/** Los 14 alérgenos de declaración obligatoria en la UE (Reglamento 1169/2011).
 *
 * Un mismo dato, dos "voces" muy distintas:
 * - Tienda pública: `icono` — un símbolo discreto, sin texto técnico, que no rompa
 *   la estética del sitio.
 * - Ficha técnica B2B (`/cuenta/catalogo.astro`): `label` — texto explícito, como
 *   corresponde a una hoja de datos para profesionales.
 *
 * `labelKey` sigue el mismo mecanismo data-i18n que el resto del sitio (ver src/lib/i18n.ts).
 */

export const ALERGENOS_IDS = [
  "gluten",
  "crustaceos",
  "huevos",
  "pescado",
  "cacahuetes",
  "soja",
  "lacteos",
  "frutos_cascara",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuces",
  "moluscos",
] as const;

export type AlergenoId = (typeof ALERGENOS_IDS)[number];

export interface AlergenoInfo {
  id: AlergenoId;
  icono: string;
  label: string;
  labelKey: string;
}

export const ALERGENOS: Record<AlergenoId, AlergenoInfo> = {
  gluten: { id: "gluten", icono: "🌾", label: "Gluten", labelKey: "alergenos.gluten" },
  crustaceos: { id: "crustaceos", icono: "🦐", label: "Crustáceos", labelKey: "alergenos.crustaceos" },
  huevos: { id: "huevos", icono: "🥚", label: "Huevos", labelKey: "alergenos.huevos" },
  pescado: { id: "pescado", icono: "🐟", label: "Pescado", labelKey: "alergenos.pescado" },
  cacahuetes: { id: "cacahuetes", icono: "🥜", label: "Cacahuetes", labelKey: "alergenos.cacahuetes" },
  soja: { id: "soja", icono: "🫘", label: "Soja", labelKey: "alergenos.soja" },
  lacteos: { id: "lacteos", icono: "🥛", label: "Lácteos", labelKey: "alergenos.lacteos" },
  frutos_cascara: { id: "frutos_cascara", icono: "🌰", label: "Frutos de cáscara", labelKey: "alergenos.frutosCascara" },
  apio: { id: "apio", icono: "🥬", label: "Apio", labelKey: "alergenos.apio" },
  mostaza: { id: "mostaza", icono: "🌭", label: "Mostaza", labelKey: "alergenos.mostaza" },
  sesamo: { id: "sesamo", icono: "◌", label: "Sésamo", labelKey: "alergenos.sesamo" },
  sulfitos: { id: "sulfitos", icono: "🍷", label: "Sulfitos", labelKey: "alergenos.sulfitos" },
  altramuces: { id: "altramuces", icono: "🫛", label: "Altramuces", labelKey: "alergenos.altramuces" },
  moluscos: { id: "moluscos", icono: "🐚", label: "Moluscos", labelKey: "alergenos.moluscos" },
};

export function alergenoInfo(id: AlergenoId): AlergenoInfo {
  return ALERGENOS[id];
}
