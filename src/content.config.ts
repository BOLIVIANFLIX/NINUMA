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
      categoria: z.enum(["tartas", "bombones", "ediciones", "b2b"]),
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

      // Tono literario para la tienda pública — nunca una lista técnica de ingredientes.
      descripcionPublica: z.string().optional(),

      // Ficha técnica B2B (src/pages/cuenta/catalogo.astro) — `materiales` (ya
      // existente arriba) se usa junto a estos tres campos solo ahí.
      caloriasAprox: z.number().int().positive().nullable().default(null),
      caducidadDias: z.number().int().positive().nullable().default(null),
      notasTecnicas: z.string().optional(),
    }),
});

const edicionActiva = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/edicion-activa" }),
  schema: ({ image }) =>
    z.object({
      activa: z.boolean(),
      nombre: z.string(),
      plazoLabel: z.string(),
      plazoLabelKey: z.string(),
      fechaLimiteISO: z.string(),
      descripcion: z.string(),
      descripcionKey: z.string(),
      introDetalle: z.string(),
      introDetalleKey: z.string(),
      imagenDetalle: image(),
      especificaciones: z.array(
        z.object({
          etiqueta: z.string(),
          etiquetaKey: z.string(),
          valor: z.string(),
          valorKey: z.string(),
        })
      ),

      // Cajas comprables con pago real — cada edición fija sus propios precios.
      cajas: z.array(
        z.object({
          id: z.string(), // "caja-3", "caja-6", "caja-12"...
          label: z.string(),
          labelKey: z.string(),
          unidades: z.number().int().positive(),
          precio: z.number().positive(), // EUR, IVA incluido
        })
      ),
    }),
});

const edicionArchivo = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/edicion-archivo" }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      imagen: image().optional(),
      alt: z.string(),
      anio: z.string(),
      meta: z.string(),
      metaKey: z.string(),
      estado: z.string(),
      estadoKey: z.string(),
      orden: z.number(),
    }),
});

export const collections = { piezas, edicionActiva, edicionArchivo };
