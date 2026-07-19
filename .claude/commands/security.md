---
description: Auditoría de seguridad OWASP Top 10 del directorio actual
---

Actúa como Ingeniero de Seguridad Senior y Auditor Web. Revisa el proyecto actual (Astro + TypeScript) buscando específicamente:

1. **Inyección**: XSS (uso de `set:html`, `innerHTML`, interpolación sin escapar en componentes .astro/React), SQLi o inyección en cualquier query a APIs/CMS/base de datos.
2. **Cabeceras y configuración**: CORS mal configurado, cabeceras de seguridad ausentes (CSP, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options) en `astro.config.mjs`, `netlify.toml` o middleware.
3. **Fallos de lógica**: validación de formularios/inputs de usuario (client y server-side), exposición de secretos/API keys en código cliente, manejo inseguro de variables de entorno (`import.meta.env` con `PUBLIC_` vs privadas).
4. **Dependencias**: paquetes con vulnerabilidades conocidas (revisar `package.json`/`package-lock.json`).
5. **Content collections**: validación Zod insuficiente en `src/content.config.ts` que permita datos maliciosos.

Reporta hallazgos concretos con archivo:línea, severidad (crítico/alto/medio/bajo) y la corrección específica. No reportes teoría sin verificar contra el código real del proyecto. Si no hay hallazgos en una categoría, dilo brevemente en vez de omitirla.
