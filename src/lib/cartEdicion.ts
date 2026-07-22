/** Carrito de Ediciones Especiales (pago real con Stripe). Separado a propósito de
 * src/lib/cartTienda.ts: una edición es una campaña autocontenida con su propia
 * urgencia (cuenta atrás) — mezclarla con la compra normal de tienda complicaría
 * la UX sin necesidad real. */
const STORAGE_KEY = "ninuma-cart-edicion";

export interface CartEdicionItem {
  tipo: "edicion";
  edicionSlug: string;
  cajaId: string;
  nombre: string;
  precioUnitarioCents: number;
  unidades: number;
}

function read(): CartEdicionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartEdicionItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartEdicionItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCart(): CartEdicionItem[] {
  return read();
}

export function getCartCount(): number {
  return read().reduce((sum, item) => sum + item.unidades, 0);
}

export function addToCart(item: Omit<CartEdicionItem, "tipo">): CartEdicionItem[] {
  const items = read();
  const existing = items.find((i) => i.edicionSlug === item.edicionSlug && i.cajaId === item.cajaId);
  if (existing) {
    existing.unidades += item.unidades;
  } else {
    items.push({ tipo: "edicion", ...item });
  }
  write(items);
  return items;
}

export function updateCartQuantity(edicionSlug: string, cajaId: string, unidades: number): CartEdicionItem[] {
  const items = read()
    .map((i) => (i.edicionSlug === edicionSlug && i.cajaId === cajaId ? { ...i, unidades } : i))
    .filter((i) => i.unidades > 0);
  write(items);
  return items;
}

export function removeFromCart(edicionSlug: string, cajaId: string): CartEdicionItem[] {
  const items = read().filter((i) => !(i.edicionSlug === edicionSlug && i.cajaId === cajaId));
  write(items);
  return items;
}

export function clearCart(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCartTotalCents(): number {
  return read().reduce((sum, item) => sum + item.precioUnitarioCents * item.unidades, 0);
}
