import { t } from "./i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationMessages {
  required: [key: string, fallbackEs: string];
  email: [key: string, fallbackEs: string];
  rgpd: [key: string, fallbackEs: string];
}

export function validateField(
  input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  messages: ValidationMessages
): boolean {
  const errEl = document.getElementById(`${input.id}-error`);
  const isCheckbox = input instanceof HTMLInputElement && input.type === "checkbox";
  let valid = true;
  let msg = "";

  if (isCheckbox) {
    if (input.required && !input.checked) {
      valid = false;
      msg = t(...messages.rgpd);
    }
  } else if (input.required && !input.value.trim()) {
    valid = false;
    msg = t(...messages.required);
  } else if (input instanceof HTMLInputElement && input.type === "email" && input.value.trim()) {
    if (!EMAIL_RE.test(input.value.trim())) {
      valid = false;
      msg = t(...messages.email);
    }
  }

  input.setAttribute("aria-invalid", valid ? "false" : "true");
  if (errEl) errEl.textContent = valid ? "" : msg;
  return valid;
}

export function isHoneypotFilled(form: HTMLFormElement): boolean {
  const honey = form.querySelector<HTMLInputElement>('input[name="website"]');
  return !!(honey && honey.value);
}

export function submitForm(form: HTMLFormElement): Promise<Response> {
  const data: Record<string, string> = {};
  new FormData(form).forEach((val, key) => {
    if (key !== "website") data[key] = String(val);
  });
  return fetch(form.action, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
