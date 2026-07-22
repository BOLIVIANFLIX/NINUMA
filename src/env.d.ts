/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;

  // Solo servidor (rutas con `export const prerender = false`) — nunca expuestas al
  // cliente por no llevar el prefijo PUBLIC_. Configurar en el panel de Netlify
  // (Site settings → Environment variables); en local van en `.env` (gitignorado).
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  readonly RESEND_API_KEY: string;
  readonly RESEND_FROM: string;

  // Dominio público con protocolo, sin barra final — usado para construir URLs
  // absolutas de imágenes en el email (los clientes de correo no pueden cargar rutas
  // locales). Hoy https://ninuma.netlify.app, cambia a https://www.ninuma.es en el
  // cutover final — un solo valor que tocar, sin cambios de código.
  readonly SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
