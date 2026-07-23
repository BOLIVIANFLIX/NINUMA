import type { APIRoute } from "astro";
import { sendContactoConfirmationEmail } from "../../lib/email";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email de cortesía con la marca de NINUMÁ para quien rellena el formulario de
 * contacto — independiente del envío a Formspree (que sigue siendo la vía real de
 * aviso a Ariadna). Si esto falla, no debe afectar a que el formulario ya se dio
 * por enviado correctamente en el navegador. */
export const POST: APIRoute = async ({ request }) => {
  let body: { nombre?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!nombre || !EMAIL_RE.test(email)) {
    return new Response(null, { status: 400 });
  }

  await sendContactoConfirmationEmail({ to: email, nombre });
  return new Response(null, { status: 200 });
};
