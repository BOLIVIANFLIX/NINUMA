// Se ejecuta tras `astro build`. Escanea el HTML ya generado en dist/, calcula
// el hash SHA-256 exacto de cada <script> inline y de cada atributo de evento
// inline (onload=, onclick=, ...), y sustituye el placeholder __CSP_SCRIPT_HASHES__
// de public/_headers (ya copiado a dist/_headers por Astro) por la CSP real.
//
// Por qué existe: los bloques JSON-LD (schema.org) cambian de contenido en
// cada página (breadcrumbs, URLs...), así que su hash no puede escribirse a
// mano una sola vez en public/_headers — hay que recalcularlo en cada build.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const DIST = "dist";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

function sha256Base64(text) {
  return createHash("sha256").update(text, "utf8").digest("base64");
}

const htmlFiles = walk(DIST);
const scriptHashes = new Set();
const attrHashes = new Set();

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");

  for (const m of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    const content = m[1];
    if (content.trim()) scriptHashes.add(sha256Base64(content));
  }

  for (const m of html.matchAll(/\son[a-z]+="([^"]*)"/g)) {
    attrHashes.add(sha256Base64(m[1]));
  }
}

if (scriptHashes.size === 0) {
  throw new Error("generate-csp-headers: no se encontró ningún <script> inline en dist/ — ¿falló el build antes?");
}

const scriptSrcList = ["'self'", ...[...scriptHashes].map((h) => `'sha256-${h}'`), "https://www.googletagmanager.com"].join(" ");
const scriptSrcAttrList = ["'unsafe-hashes'", ...[...attrHashes].map((h) => `'sha256-${h}'`)].join(" ");

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrcList}`,
  `script-src-attr ${scriptSrcAttrList}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://www.google-analytics.com",
  "connect-src 'self' https://formspree.io https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://www.google.com https://maps.google.com",
  "form-action 'self' https://formspree.io",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const headersPath = join(DIST, "_headers");
const template = readFileSync(headersPath, "utf8");
if (!template.includes("__CSP_SCRIPT_HASHES__")) {
  throw new Error(`generate-csp-headers: no se encontró el placeholder __CSP_SCRIPT_HASHES__ en ${headersPath}`);
}
writeFileSync(headersPath, template.replace("__CSP_SCRIPT_HASHES__", csp));

console.log(
  `[generate-csp-headers] CSP escrita en ${headersPath} (${scriptHashes.size} hash(es) de script, ${attrHashes.size} de atributo)`
);
