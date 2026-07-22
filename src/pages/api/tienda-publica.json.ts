import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getImage } from "astro:assets";

/** Endpoint deliberadamente más pobre que /api/piezas.json: solo piezas en venta
 * (precioPublico !== null) y sin materiales/calorías/caducidad — la tienda pública
 * nunca debe filtrar la ficha técnica interna. Ver src/lib/alergenos.ts para el
 * significado de "alergenos" aquí (se renderiza como iconos, no como texto). */
export const GET: APIRoute = async () => {
  const entries = await getCollection("piezas", (e) => e.data.precioPublico !== null);

  const piezas = await Promise.all(
    entries.map(async (e) => {
      const optimized = await getImage({ src: e.data.imagen, width: 480 });
      return {
        numero: e.data.numero,
        nombre: e.data.nombre,
        imagen: optimized.src,
        href: `/creaciones/#pieza-${e.data.numero}`,
        categoria: e.data.categoria,
        precioPublico: e.data.precioPublico,
        alergenos: e.data.alergenos,
        descripcionPublica: e.data.descripcionPublica ?? null,
      };
    })
  );

  return new Response(JSON.stringify(piezas), {
    headers: { "Content-Type": "application/json" },
  });
};
