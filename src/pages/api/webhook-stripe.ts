import type { APIRoute } from "astro";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmationEmail } from "../../lib/email";

export const prerender = false;

interface ItemParaGuardar {
  referencia: string;
  nombre: string;
  precio_unitario_cents: number;
  unidades: number;
}

async function construirLineasDesdeStripe(stripe: Stripe, sessionId: string): Promise<ItemParaGuardar[]> {
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ["data.price.product"],
  });

  return lineItems.data.map((item) => {
    const product = item.price?.product;
    const referencia =
      product && typeof product === "object" && "metadata" in product ? (product.metadata.referencia ?? "desconocida") : "desconocida";
    return {
      referencia,
      nombre: item.description ?? "Pieza",
      precio_unitario_cents: item.price?.unit_amount ?? 0,
      unidades: item.quantity ?? 1,
    };
  });
}

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Webhook no configurado", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Falta stripe-signature", { status: 400 });

  const rawBody = await request.text();
  const stripe = new Stripe(stripeKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new Response("Firma inválida", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(null, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    // Métodos de pago con confirmación diferida (no aplica hoy a tarjeta, que es
    // instantánea) llegarían más adelante como checkout.session.async_payment_succeeded —
    // fuera de alcance por ahora, no hay nada que guardar todavía.
    return new Response(null, { status: 200 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const kind = session.metadata?.kind === "edicion" ? "edicion" : "tienda";
  const userId = session.metadata?.user_id || session.client_reference_id || null;

  let items: ItemParaGuardar[];
  try {
    items = await construirLineasDesdeStripe(stripe, session.id);
  } catch {
    return new Response("No se pudieron leer las líneas del pedido", { status: 500 });
  }

  const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
  const totalCents = session.amount_total ?? items.reduce((sum, i) => sum + i.precio_unitario_cents * i.unidades, 0);
  const lineasTexto = items.map((i) => `- ${i.unidades}× ${i.nombre} (${eur.format((i.precio_unitario_cents * i.unidades) / 100)})`);
  const descripcion = `Pedido de ${kind === "tienda" ? "tienda online" : "edición especial"}:\n${lineasTexto.join("\n")}\nTotal: ${eur.format(totalCents / 100)}\nRecogida en el obrador.`;

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      kind,
      description: descripcion,
      status: "recibido",
      guest_nombre: userId ? null : (session.customer_details?.name ?? null),
      guest_email: userId ? null : (session.customer_details?.email ?? null),
      guest_telefono: userId ? null : (session.customer_details?.phone ?? null),
      total_cents: totalCents,
      payment_status: "pagado",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    })
    .select("id")
    .single();

  if (orderError) {
    // Reintento del mismo webhook (Stripe reenvía si no responde 200): la sesión ya
    // se procesó, el unique de stripe_checkout_session_id lo bloquea — no es un fallo.
    if (orderError.code === "23505") return new Response(null, { status: 200 });
    return new Response("No se pudo guardar el pedido", { status: 500 });
  }

  const { error: itemsError } = await admin.from("order_items").insert(
    items.map((i) => ({
      order_id: order.id,
      referencia: i.referencia,
      nombre: i.nombre,
      precio_unitario_cents: i.precio_unitario_cents,
      unidades: i.unidades,
    }))
  );
  if (itemsError) return new Response("No se pudieron guardar las líneas del pedido", { status: 500 });

  const emailDestino = session.customer_details?.email;
  if (emailDestino) {
    await sendOrderConfirmationEmail({
      to: emailDestino,
      kind,
      items: items.map((i) => ({ nombre: i.nombre, unidades: i.unidades, precioUnitarioCents: i.precio_unitario_cents })),
      totalCents,
    });
  }

  return new Response(null, { status: 200 });
};
