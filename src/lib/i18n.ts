export const LANGS = ["es", "ca", "en", "de", "fr"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG = "es" satisfies Lang;
export const LANG_KEY = "ninuma_lang";
export const LANG_LABELS: Record<Lang, string> = {
  es: "Español",
  ca: "Català",
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

type Dict = Record<string, string>;

const loaders: Record<Exclude<Lang, "es">, () => Promise<{ default: Dict }>> = {
  ca: () => import("../i18n/ca.json"),
  en: () => import("../i18n/en.json"),
  fr: () => import("../i18n/fr.json"),
  de: () => import("../i18n/de.json"),
};

let currentDict: Dict | null = null;
let currentLang: Lang = DEFAULT_LANG;

export function getSavedLang(): Lang {
  if (typeof localStorage === "undefined") return DEFAULT_LANG;
  const saved = localStorage.getItem(LANG_KEY);
  return (LANGS as readonly string[]).includes(saved || "") ? (saved as Lang) : DEFAULT_LANG;
}

export function getCurrentLang(): Lang {
  return currentLang;
}

/** Traduce un texto suelto conocido por el runtime (usado por scripts que generan
 * mensajes dinámicos, p.ej. errores de validación de formularios). Si no hay
 * traducción cargada (idioma = es) o falta la clave, devuelve el texto en español. */
export function t(key: string, fallbackEs: string): string {
  if (!currentDict) return fallbackEs;
  return currentDict[key] ?? fallbackEs;
}

function translateDom() {
  const dict = currentDict;
  const root = document;

  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n")!;
    const value = dict ? dict[key] : undefined;
    if (value !== undefined) {
      el.innerHTML = value;
    } else if (!dict && el.dataset.i18nOriginal) {
      el.innerHTML = el.dataset.i18nOriginal;
    }
  });

  root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder")!;
    const value = dict ? dict[key] : undefined;
    if (value !== undefined) el.placeholder = value;
    else if (!dict && el.dataset.i18nPlaceholderOriginal) el.placeholder = el.dataset.i18nPlaceholderOriginal;
  });

  root.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label")!;
    const value = dict ? dict[key] : undefined;
    if (value !== undefined) el.setAttribute("aria-label", value);
    else if (!dict && el.dataset.i18nAriaLabelOriginal) el.setAttribute("aria-label", el.dataset.i18nAriaLabelOriginal);
  });

  root.querySelectorAll<HTMLImageElement>("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt")!;
    const value = dict ? dict[key] : undefined;
    if (value !== undefined) el.setAttribute("alt", value);
    else if (!dict && el.dataset.i18nAltOriginal) el.setAttribute("alt", el.dataset.i18nAltOriginal);
  });
}

/** Guarda el texto original en español de cada nodo marcado, la primera vez,
 * para poder volver a español sin recargar la página. */
function snapshotOriginals() {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    if (el.dataset.i18nOriginal === undefined) el.dataset.i18nOriginal = el.innerHTML;
  });
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-i18n-placeholder]").forEach((el) => {
    if (el.dataset.i18nPlaceholderOriginal === undefined) el.dataset.i18nPlaceholderOriginal = el.placeholder;
  });
  document.querySelectorAll<HTMLElement>("[data-i18n-aria-label]").forEach((el) => {
    if (el.dataset.i18nAriaLabelOriginal === undefined)
      el.dataset.i18nAriaLabelOriginal = el.getAttribute("aria-label") || "";
  });
  document.querySelectorAll<HTMLImageElement>("[data-i18n-alt]").forEach((el) => {
    if (el.dataset.i18nAltOriginal === undefined) el.dataset.i18nAltOriginal = el.getAttribute("alt") || "";
  });
}

async function applyLang(lang: Lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  snapshotOriginals();

  if (lang === DEFAULT_LANG) {
    currentDict = null;
  } else {
    const mod = await loaders[lang]();
    currentDict = mod.default;
  }

  translateDom();
  document.dispatchEvent(new CustomEvent("ninuma:lang-changed", { detail: { lang } }));
  document.documentElement.removeAttribute("data-lang-loading");
}

export async function initLang() {
  await applyLang(getSavedLang());
}

export async function setLang(lang: Lang) {
  localStorage.setItem(LANG_KEY, lang);
  await applyLang(lang);
}
