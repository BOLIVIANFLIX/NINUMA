// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

/** @type {Record<string, { priority: number; changefreq: ChangeFreqEnum }>} */
const PRIORITY = {
  '/': { priority: 1.0, changefreq: ChangeFreqEnum.MONTHLY },
  '/obrador/': { priority: 0.8, changefreq: ChangeFreqEnum.YEARLY },
  '/creaciones/': { priority: 0.9, changefreq: ChangeFreqEnum.MONTHLY },
  '/ediciones-especiales/': { priority: 0.9, changefreq: ChangeFreqEnum.WEEKLY },
  '/presencia/': { priority: 0.7, changefreq: ChangeFreqEnum.YEARLY },
  '/contacto/': { priority: 0.8, changefreq: ChangeFreqEnum.YEARLY },
  '/faq/': { priority: 0.6, changefreq: ChangeFreqEnum.YEARLY },
  '/aviso-legal/': { priority: 0.3, changefreq: ChangeFreqEnum.YEARLY },
  '/privacidad/': { priority: 0.3, changefreq: ChangeFreqEnum.YEARLY },
  '/cookies/': { priority: 0.3, changefreq: ChangeFreqEnum.YEARLY },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ninuma.es',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/confirmacion') && !page.includes('/404'),
      serialize(item) {
        const path = new URL(item.url).pathname;
        const meta = PRIORITY[path];
        return meta ? { ...item, ...meta } : item;
      },
    }),
  ],
});
