import type { APIRoute } from "astro";
import Stripe from "stripe";

export const prerender = false;

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ params }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return jsonError("No disponible ahora mismo.", 503);

  const sessionId = params.sessionId;
  // Los ids de sesión de Stripe siempre empiezan por "cs_" — evita hacer una llamada a
  // Stripe con basura si alguien manipula la URL a mano.
  if (!sessionId || !sessionId.startsWith("cs_")) return jsonError("Pedido no encontrado.", 404);

  const stripe = new Stripe(stripeKey);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch {
    return jsonError("Pedido no encontrado.", 404);
  }

  const items = (session.line_items?.data ?? []).map((item) => ({
    nombre: item.description ?? "Pieza",
    unidades: item.quantity ?? 1,
    precioUnitarioCents: item.quantity ? Math.round((item.amount_subtotal ?? 0) / item.quantity) : (item.amount_subtotal ?? 0),
  }));

  return new Response(
    JSON.stringify({
      pagado: session.payment_status === "paid",
      kind: session.metadata?.kind === "edicion" ? "edicion" : "tienda",
      totalCents: session.amount_total ?? 0,
      email: session.customer_details?.email ?? null,
      items,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
