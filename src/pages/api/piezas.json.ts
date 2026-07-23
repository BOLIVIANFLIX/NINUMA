import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { getCollection } from "astro:content";
import { getImage } from "astro:assets";

export const prerender = false;

/** Ficha técnica (calorías, caducidad, notas) — solo para clientes con sesión
 * iniciada (ver src/pages/cuenta/catalogo.astro y FavoritosSection.astro). El
 * catálogo público sin estos campos vive en /api/tienda-publica.json. */
export const GET: APIRoute = async ({ request }) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return new Response("No disponible", { status: 503 });

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return new Response("No autorizado", { status: 401 });

  const supabase = createClient(supabaseUrl, anonKey);
  const {
    data: { user },
  } = await supabase.auth.getUser(token);
  if (!user) return new Response("No autorizado", { status: 401 });

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
        // Ficha técnica B2B — solo se consume desde /cuenta/catalogo.astro.
        alergenos: e.data.alergenos,
        vegano: e.data.vegano,
        caloriasAprox: e.data.caloriasAprox,
        caducidadDias: e.data.caducidadDias,
        notasTecnicas: e.data.notasTecnicas ?? null,
      };
    })
  );

  return new Response(JSON.stringify(piezas), {
    headers: { "Content-Type": "application/json" },
  });
};
