import type { APIRoute } from "astro";
import Stripe from "stripe";
import { getCollection } from "astro:content";
import { getActiveEdition } from "../../lib/edition";

export const prerender = false;

const MINIMO_CENTS = 2000;

interface LineaPieza {
  tipo: "pieza";
  numero: string;
  unidades: number;
}

interface LineaEdicion {
  tipo: "edicion";
  edicionSlug: string;
  cajaId: string;
  unidades: number;
}

type LineaEntrada = LineaPieza | LineaEdicion;

interface RevalidatedLine {
  referencia: string;
  nombre: string;
  precioUnitarioCents: number;
  unidades: number;
}

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function esUnidadesValida(unidades: unknown): unidades is number {
  return typeof unidades === "number" && Number.isInteger(unidades) && unidades > 0 && unidades <= 10;
}

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return jsonError("La pasarela de pago no está disponible ahora mismo.", 503);

  let body: { lineas?: unknown; userId?: string | null; origen?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Petición inválida.");
  }

  const lineasEntrada = body.lineas;
  if (!Array.isArray(lineasEntrada) || lineasEntrada.length === 0) {
    return jsonError("El carrito está vacío.");
  }
  if (lineasEntrada.length > 30) {
    return jsonError("Demasiadas líneas en el pedido.");
  }

  const origen = body.origen === "edicion" ? "edicion" : "tienda";
  const userId = typeof body.userId === "string" && body.userId ? body.userId : null;

  const revalidadas: RevalidatedLine[] = [];

  if (origen === "tienda") {
    const piezas = await getCollection("piezas", (e) => e.data.precioPublico !== null);
    const porNumero = new Map(piezas.map((p) => [p.data.numero, p.data]));

    for (const raw of lineasEntrada as LineaEntrada[]) {
      if (!raw || raw.tipo !== "pieza" || typeof raw.numero !== "string" || !esUnidadesValida(raw.unidades)) {
        return jsonError("Línea de pedido inválida.");
      }
      const pieza = porNumero.get(raw.numero);
      if (!pieza || pieza.precioPublico === null) {
        return jsonError(`La pieza ${raw.numero} ya no está disponible en la tienda online.`);
      }
      revalidadas.push({
        referencia: pieza.numero,
        nombre: pieza.nombre,
        precioUnitarioCents: Math.round(pieza.precioPublico * 100),
        unidades: raw.unidades,
      });
    }
  } else {
    const edicion = await getActiveEdition();
    if (!edicion) return jsonError("No hay ninguna edición especial activa ahora mismo.");
    if (Date.now() >= new Date(edicion.fechaLimiteISO).getTime()) {
      return jsonError("El período de compra para esta edición ha finalizado.");
    }
    const cajasPorId = new Map(edicion.cajas.map((c) => [c.id, c]));

    for (const raw of lineasEntrada as LineaEntrada[]) {
      if (
        !raw ||
        raw.tipo !== "edicion" ||
        typeof raw.edicionSlug !== "string" ||
        typeof raw.cajaId !== "string" ||
        !esUnidadesValida(raw.unidades)
      ) {
        return jsonError("Línea de pedido inválida.");
      }
      if (raw.edicionSlug !== edicion.slug) {
        return jsonError("Esta edición ya no está activa.");
      }
      const caja = cajasPorId.get(raw.cajaId);
      if (!caja) return jsonError("Ese tamaño de caja ya no está disponible.");
      revalidadas.push({
        referencia: `${edicion.slug}:${caja.id}`,
        nombre: `${edicion.nombre} — ${caja.label}`,
        precioUnitarioCents: Math.round(caja.precio * 100),
        unidades: raw.unidades,
      });
    }
  }

  const totalCents = revalidadas.reduce((sum, l) => sum + l.precioUnitarioCents * l.unidades, 0);
  if (totalCents < MINIMO_CENTS) {
    return jsonError("El pedido mínimo para pagar online es de 20 €.");
  }

  const origin = new URL(request.url).origin;
  const successPath = origen === "tienda" ? "/tienda/confirmacion/" : "/ediciones-especiales/confirmacion/";
  const cancelPath = origen === "tienda" ? "/tienda/carrito/" : "/ediciones-especiales/";

  const stripe = new Stripe(stripeKey);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: revalidadas.map((l) => ({
        quantity: l.unidades,
        price_data: {
          currency: "eur",
          unit_amount: l.precioUnitarioCents,
          product_data: {
            name: l.nombre,
            metadata: { referencia: l.referencia },
          },
        },
      })),
      phone_number_collection: { enabled: true },
      client_reference_id: userId ?? undefined,
      metadata: { kind: origen, user_id: userId ?? "" },
      // Etiqueta fija (no varía por sesión) para poder comparar este flujo de checkout
      // en el Dashboard de Stripe frente a otras integraciones.
      integration_identifier: "ninuma_checkout_ohxpqzvk",
      success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}`,
    });

    if (!session.url) return jsonError("No se ha podido iniciar el pago.", 502);
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return jsonError("No se ha podido iniciar el pago. Inténtalo de nuevo.", 502);
  }
};
