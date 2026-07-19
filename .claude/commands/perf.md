---
description: Análisis de rendimiento (CLS/LCP) y accesibilidad WCAG
---

Actúa como Auditor Web Senior especializado en rendimiento y accesibilidad. Analiza la estructura HTML/JS/CSS del proyecto actual (Astro) buscando:

1. **CLS (Cumulative Layout Shift)**: imágenes sin `width`/`height` o `aspect-ratio`, fuentes web sin `font-display`, contenido inyectado dinámicamente sin reservar espacio, anuncios/embeds sin dimensiones fijas.
2. **LCP (Largest Contentful Paint)**: imagen/elemento LCP sin `loading="eager"`/`fetchpriority="high"`, imágenes no optimizadas (formato, tamaño, falta de uso de `astro:assets`), render-blocking CSS/JS, fuentes no precargadas.
3. **JS/CSS innecesario**: bundles grandes, hidratación de componentes React/framework sin necesidad (`client:load` cuando bastaría `client:visible` o `client:idle`), CSS no usado.
4. **Accesibilidad WCAG**: contraste de color, `alt` en imágenes, jerarquía de encabezados, labels en formularios, foco visible, roles ARIA mal usados, navegación por teclado.
5. **Otros Core Web Vitals**: INP (interactividad), uso de `astro:assets` para optimización automática de imágenes.

Reporta hallazgos concretos con archivo:línea, impacto estimado en la métrica afectada, y la corrección específica. Prioriza por impacto real, no por cantidad de hallazgos.
