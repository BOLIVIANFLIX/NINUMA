import { supabase } from "./supabase";
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
  vegano: boolean;
  caloriasAprox: number | null;
  caducidadDias: number | null;
  notasTecnicas: string | null;
}

let cache: Promise<PiezaCatalogItem[]> | null = null;

/** Un único fetch por carga de página, reutilizado por favoritos y catálogo.
 * La ficha técnica (calorías, caducidad, notas) solo es para clientes con sesión
 * iniciada — el endpoint exige el token de acceso de Supabase en Authorization. */
export function getPiezasCatalog(): Promise<PiezaCatalogItem[]> {
  if (!cache) {
    cache = (async () => {
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      if (!session) return [];
      const res = await fetch("/api/piezas.json", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return [];
      return res.json();
    })();
  }
  return cache;
}
