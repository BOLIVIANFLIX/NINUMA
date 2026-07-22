import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { ALERGENOS_IDS } from "./lib/alergenos";

const piezas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/piezas" }),
  schema: ({ image }) =>
    z.object({
      numero: z.string(),
      imagen: image(),
      alt: z.string(),
      categoria: z.enum(["tartas", "bombones", "postres", "ediciones", "b2b"]),
      tipo: z.string(),
      tipoKey: z.string(),
      nombre: z.string(),
      materiales: z.string(),
      materialesKey: z.string(),
      referencia: z.string(),
      referenciaKey: z.string(),
      estado: z.string(),
      estadoKey: z.string(),
      anio: z.string(),
      orden: z.number(),

      // Tienda pública: precio fijo (EUR, IVA incluido). null = no se vende online,
      // solo por encargo. Es la única señal de "está en venta en /tienda/".
      precioPublico: z.number().positive().nullable().default(null),

      // Alérgenos UE — dato compartido, cada vista lo renderiza distinto (iconos en
      // público, lista técnica en la ficha B2B). Ver src/lib/alergenos.ts.
      alergenos: z.array(z.enum(ALERGENOS_IDS)).default([]),

      // Distintivo dietético — se muestra igual (icono/texto) en público y en B2B.
      vegano: z.boolean().default(false),

      // Tono literario para la tienda pública — nunca una lista técnica de ingredientes.
      descripcionPublica: z.string().optional(),

      // Ficha técnica B2B (src/pages/cuenta/catalogo.astro) — `materiales` (ya
      // existente arriba) se usa junto a estos tres campos solo ahí.
      caloriasAprox: z.number().int().positive().nullable().default(null),
      caducidadDias: z.number().int().positive().nullable().default(null),
      notasTecnicas: z.string().optional(),
    }),
});

// Cada tirada (bombones de Halloween, tartas de San Valentín...) es un producto
// efímero e irrepetible: se vende un tiempo fijo y no se vuelve a hacer. Una sola
// colección para activa/cerrada, cada una con su propia URL permanente en
// /ediciones-especiales/[slug]/ — así lo que ya se cerró sigue indexado en vez
// de perderse en una tarjeta sin enlace. Ver src/pages/ediciones-especiales/[slug].astro.
const especificacionSchema = z.object({
  etiqueta: z.string(),
  etiquetaKey: z.string(),
  valor: z.string(),
  valorKey: z.string(),
});

const cajaSchema = z.object({
  id: z.string(), // "caja-3", "caja-6", "caja-12"...
  label: z.string(),
  labelKey: z.string(),
  unidades: z.number().int().positive(),
  precio: z.number().positive(), // EUR, IVA incluido
});

const edicionCamposComunes = {
  nombre: z.string(),
  anio: z.string(),
  orden: z.number(),
  alt: z.string(),
  meta: z.string(),
  metaKey: z.string(),
};

const ediciones = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/ediciones" }),
  // Unión discriminada por "estado": una edición activa necesita la ficha
  // completa (cuenta atrás, cajas con precio, historia) porque acepta compra
  // real (ver crear-sesion-pago.ts); una cerrada solo necesita lo mínimo para
  // su página de archivo — Zod obliga a rellenar lo primero antes de marcar
  // "activa" una edición nueva, en vez de fallar en producción.
  schema: ({ image }) =>
    z.discriminatedUnion("estado", [
      z.object({
        estado: z.literal("cerrada"),
        ...edicionCamposComunes,
        imagen: image().optional(),
        descripcion: z.string().optional(),
        descripcionKey: z.string().optional(),
        introDetalle: z.string().optional(),
        introDetalleKey: z.string().optional(),
        especificaciones: z.array(especificacionSchema).default([]),
        cajas: z.array(cajaSchema).default([]),
      }),
      z.object({
        estado: z.literal("activa"),
        ...edicionCamposComunes,
        imagen: image(),
        plazoLabel: z.string(),
        plazoLabelKey: z.string(),
        fechaLimiteISO: z.string(),
        descripcion: z.string(),
        descripcionKey: z.string(),
        introDetalle: z.string(),
        introDetalleKey: z.string(),
        imagenDetalle: image(),
        especificaciones: z.array(especificacionSchema),
        cajas: z.array(cajaSchema),
      }),
    ]),
});

export const collections = { piezas, ediciones };
