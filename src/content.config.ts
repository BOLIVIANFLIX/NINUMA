import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

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
