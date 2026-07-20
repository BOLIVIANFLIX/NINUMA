import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getImage } from "astro:assets";

export const GET: APIRoute = async () => {
  const entries = await getCollection("piezas");

  const piezas = await Promise.all(
    entries.map(async (e) => {
      const optimized = await getImage({ src: e.data.imagen, width: 480 });
      return {
        numero: e.data.numero,
        nombre: e.data.nombre,
        imagen: optimized.src,
        href: `/creaciones/#pieza-${e.data.numero}`,
        materiales: e.data.materiales,
        categoria: e.data.categoria,
      };
    })
  );

  return new Response(JSON.stringify(piezas), {
    headers: { "Content-Type": "application/json" },
  });
};
