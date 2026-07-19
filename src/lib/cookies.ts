export const COOKIE_KEY = "ninuma_cookies";
export const GA_ID = "G-QRFC7CMTKN";

/** Pasado este tiempo se vuelve a pedir consentimiento (AEPD recomienda no
 * mantener una elección de cookies indefinidamente). */
export const COOKIE_CONSENT_MAX_AGE_DAYS = 365;

export type CookieChoice = "accepted" | "rejected";

export interface StoredConsent {
  value: CookieChoice;
  ts: number;
}

export function readConsent(): StoredConsent | null {
  const raw = localStorage.getItem(COOKIE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.value === "accepted" || parsed.value === "rejected") && typeof parsed.ts === "number") {
      const ageDays = (Date.now() - parsed.ts) / 86_400_000;
      if (ageDays > COOKIE_CONSENT_MAX_AGE_DAYS) return null;
      return parsed as StoredConsent;
    }
  } catch {
    // Formato antiguo (string plano "accepted"/"rejected" sin fecha): se trata
    // como caducado para forzar volver a preguntar con el nuevo formato.
  }
  return null;
}

export function writeConsent(value: CookieChoice) {
  localStorage.setItem(COOKIE_KEY, JSON.stringify({ value, ts: Date.now() } satisfies StoredConsent));
}
