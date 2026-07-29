import { Resend } from "resend";

export interface OrderEmailItem {
  nombre: string;
  unidades: number;
  precioUnitarioCents: number;
}

export interface DatosCenaEmail {
  fechaEvento: string;
  horaEvento: string;
  ubicacionEvento: string;
}

export interface SendOrderConfirmationParams {
  to: string;
  kind: "tienda" | "edicion";
  items: OrderEmailItem[];
  totalCents: number;
  cena?: DatosCenaEmail | null;
}

function bloqueEntrega(cena: DatosCenaEmail | null | undefined): string {
  if (cena) {
    const fecha = cena.fechaEvento
      ? new Date(cena.fechaEvento).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
      : "Fecha por confirmar";
    return `
                      <strong style="color:#f0b4c4;">Tu plaza está reservada.</strong><br />
                      ${escapeHtml(fecha)}${cena.horaEvento ? ` a las ${escapeHtml(cena.horaEvento)}` : ""}.<br />
                      ${escapeHtml(cena.ubicacionEvento || "")}`;
  }
  return `
                      <strong style="color:#f0b4c4;">Recogida en el obrador.</strong><br />
                      Carrer de Guillem Massot, 48, 07003 Palma de Mallorca.<br />
                      Lun–Jue 10:00–13:30 · Vie 10:30–13:30 · Sáb 10:00–13:30. Domingos cerrado.`;
}

const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}

function buildOrderConfirmationHtml({ kind, items, totalCents, cena }: Omit<SendOrderConfirmationParams, "to">): string {
  const logoUrl = `${import.meta.env.SITE_URL}/images/ninuma-logo-email.png`;
  const filas = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#e8e8e8;font-family:Georgia,serif;font-size:15px;">${item.unidades}× ${escapeHtml(item.nombre)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#c9c9c9;font-family:Georgia,serif;font-size:15px;text-align:right;">${eur.format((item.precioUnitarioCents * item.unidades) / 100)}</td>
        </tr>`
    )
    .join("");

  const origenLabel = cena ? "tu reserva para la cena" : kind === "tienda" ? "tu pedido en la tienda online" : "tu compra en Ediciones Especiales";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #2a2a2a;">
            <tr>
              <td style="padding:24px 40px;text-align:center;background-color:#f7f2f2;border-bottom:1px solid #2a2a2a;">
                <img src="${logoUrl}" alt="NINUMÁ — Ariadna Salvador" width="192" style="display:inline-block;width:192px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 8px 40px;">
                <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f0b4c4;">Pedido confirmado</p>
                <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f5f5f5;">Gracias por ${origenLabel}.</h1>
                <p style="margin:16px 0 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#aaaaaa;">
                  Hemos confirmado el pago. Aquí tienes el resumen:
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${filas}
                  <tr>
                    <td style="padding:16px 0 0 0;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#aaaaaa;">Total</td>
                    <td style="padding:16px 0 0 0;font-family:Georgia,serif;font-size:20px;color:#f5f5f5;text-align:right;">${eur.format(totalCents / 100)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #f0b4c4;background-color:#191919;">
                  <tr>
                    <td style="padding:16px 20px;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#aaaaaa;">${bloqueEntrega(cena)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 40px 40px;text-align:center;border-top:1px solid #2a2a2a;">
                <p style="margin:0;padding-top:24px;font-family:Arial,sans-serif;font-size:12px;color:#666666;">
                  ¿Dudas con tu pedido? Escríbenos a <a href="mailto:ariadna@ninuma.es" style="color:#f0b4c4;">ariadna@ninuma.es</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface SendOrderNotificationParams {
  kind: "tienda" | "edicion";
  items: OrderEmailItem[];
  totalCents: number;
  cena?: DatosCenaEmail | null;
  clienteNombre: string | null;
  clienteEmail: string | null;
  clienteTelefono: string | null;
}

function buildOrderNotificationHtml({ kind, items, totalCents, cena, clienteNombre, clienteEmail, clienteTelefono }: SendOrderNotificationParams): string {
  const logoUrl = `${import.meta.env.SITE_URL}/images/ninuma-logo-email.png`;
  const filas = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#e8e8e8;font-family:Georgia,serif;font-size:15px;">${item.unidades}× ${escapeHtml(item.nombre)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#c9c9c9;font-family:Georgia,serif;font-size:15px;text-align:right;">${eur.format((item.precioUnitarioCents * item.unidades) / 100)}</td>
        </tr>`
    )
    .join("");

  const origenLabel = cena ? "Cena temática" : kind === "tienda" ? "Tienda online" : "Ediciones Especiales";

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #2a2a2a;">
            <tr>
              <td style="padding:24px 40px;text-align:center;background-color:#f7f2f2;border-bottom:1px solid #2a2a2a;">
                <img src="${logoUrl}" alt="NINUMÁ — Ariadna Salvador" width="192" style="display:inline-block;width:192px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 8px 40px;">
                <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f0b4c4;">Nuevo pedido — ${origenLabel}</p>
                <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f5f5f5;">${cena ? "Te han reservado una plaza." : "Te han hecho un pedido."}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${filas}
                  <tr>
                    <td style="padding:16px 0 0 0;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#aaaaaa;">Total</td>
                    <td style="padding:16px 0 0 0;font-family:Georgia,serif;font-size:20px;color:#f5f5f5;text-align:right;">${eur.format(totalCents / 100)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 40px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #f0b4c4;background-color:#191919;">
                  <tr>
                    <td style="padding:16px 20px;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#aaaaaa;">
                      <strong style="color:#f0b4c4;">Cliente</strong><br />
                      ${escapeHtml(clienteNombre || "Sin nombre")}<br />
                      ${clienteEmail ? `<a href="mailto:${escapeHtml(clienteEmail)}" style="color:#f0b4c4;">${escapeHtml(clienteEmail)}</a><br />` : ""}
                      ${clienteTelefono ? escapeHtml(clienteTelefono) : "Sin teléfono"}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 40px 40px;text-align:center;border-top:1px solid #2a2a2a;">
                <p style="margin:0;padding-top:24px;font-family:Arial,sans-serif;font-size:12px;color:#666666;">
                  Pedido pagado y guardado — puedes verlo también en /cuenta/admin/pedidos/
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface SendContactoConfirmationParams {
  to: string;
  nombre: string;
}

function buildContactoConfirmationHtml({ nombre }: Omit<SendContactoConfirmationParams, "to">): string {
  const logoUrl = `${import.meta.env.SITE_URL}/images/ninuma-logo-email.png`;

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #2a2a2a;">
            <tr>
              <td style="padding:24px 40px;text-align:center;background-color:#f7f2f2;border-bottom:1px solid #2a2a2a;">
                <img src="${logoUrl}" alt="NINUMÁ — Ariadna Salvador" width="192" style="display:inline-block;width:192px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 8px 40px;">
                <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f0b4c4;">Mensaje recibido</p>
                <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#f5f5f5;">Gracias, ${escapeHtml(nombre)}.</h1>
                <p style="margin:16px 0 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#aaaaaa;">
                  Hemos recibido tu mensaje. Respondo en menos de 48 horas en días laborables. Si tienes una fecha muy próxima o una urgencia, lo más rápido es llamar o escribir por Instagram.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 40px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:2px solid #f0b4c4;background-color:#191919;">
                  <tr>
                    <td style="padding:16px 20px;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#aaaaaa;">
                      <strong style="color:#f0b4c4;">¿Urgente?</strong><br />
                      Llámame al <a href="tel:+34666138465" style="color:#f0b4c4;">+34 666 13 84 65</a> o escríbeme por Instagram a <a href="https://instagram.com/ninuma_concept" style="color:#f0b4c4;">@ninuma_concept</a>.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 40px 40px;text-align:center;border-top:1px solid #2a2a2a;">
                <p style="margin:0;padding-top:24px;font-family:Arial,sans-serif;font-size:12px;color:#666666;">
                  Este es un email automático de confirmación — responde directamente a este correo o escribe a <a href="mailto:ariadna@ninuma.es" style="color:#f0b4c4;">ariadna@ninuma.es</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** No lanza si Resend no está configurado o falla el envío: el mensaje ya llegó por
 * Formspree antes de llegar aquí — un fallo en este email de cortesía no debe romper
 * la experiencia de haber contactado correctamente. */
export async function sendContactoConfirmationEmail(params: SendContactoConfirmationParams): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from,
      to: params.to,
      subject: "Hemos recibido tu mensaje — NINUMÁ",
      html: buildContactoConfirmationHtml(params),
    });
  } catch {
    // Silencioso a propósito — ver comentario de la función.
  }
}

/** No lanza si Resend no está configurado o falla el envío: el pedido ya está guardado
 * en Supabase antes de llegar aquí — si este email falla, el pedido sigue siendo
 * visible en /cuenta/admin/pedidos/, y no queremos tumbar el webhook ni provocar que
 * Stripe lo reintente sin necesidad. */
export async function sendOrderNotificationEmail(params: SendOrderNotificationParams): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const resend = new Resend(apiKey);
  const subject = params.cena
    ? "Nueva plaza reservada — Cena NINUMÁ"
    : params.kind === "tienda"
      ? "Nuevo pedido en la tienda — NINUMÁ"
      : "Nueva compra en Ediciones Especiales — NINUMÁ";

  try {
    await resend.emails.send({
      from,
      to: "ariadna@ninuma.es",
      replyTo: params.clienteEmail || undefined,
      subject,
      html: buildOrderNotificationHtml(params),
    });
  } catch {
    // Silencioso a propósito — ver comentario de la función.
  }
}

/** No lanza si Resend no está configurado o falla el envío: el pedido ya está guardado
 * en Supabase antes de llegar aquí, un email fallido no debe tumbar el webhook ni
 * provocar que Stripe lo reintente sin necesidad. */
export async function sendOrderConfirmationEmail(params: SendOrderConfirmationParams): Promise<void> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const resend = new Resend(apiKey);
  const subject = params.cena ? "Tu plaza reservada — Cena NINUMÁ" : params.kind === "tienda" ? "Tu pedido en NINUMÁ" : "Tu compra en Ediciones Especiales NINUMÁ";

  try {
    await resend.emails.send({
      from,
      to: params.to,
      subject,
      html: buildOrderConfirmationHtml(params),
    });
  } catch {
    // Silencioso a propósito — ver comentario de la función.
  }
}
