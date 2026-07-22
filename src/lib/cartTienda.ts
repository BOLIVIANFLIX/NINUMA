/** Carrito de la tienda pública (pago real con Stripe). Separado a propósito de
 * src/lib/cart.ts (que sigue siendo solo para el flujo B2B/B2C privado sin pago):
 * un cambio aquí nunca debe poder afectar al carrito de "pedido sin pagar". */
const STORAGE_KEY = "ninuma-cart-tienda";

export interface CartTiendaItem {
  tipo: "pieza";
  numero: string;
  nombre: string;
  precioUnitarioCents: number;
  unidades: number;
}

function read(): CartTiendaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartTiendaItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartTiendaItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCart(): CartTiendaItem[] {
  return read();
}

export function getCartCount(): number {
  return read().reduce((sum, item) => sum + item.unidades, 0);
}

export function addToCart(item: Omit<CartTiendaItem, "tipo">): CartTiendaItem[] {
  const items = read();
  const existing = items.find((i) => i.numero === item.numero);
  if (existing) {
    existing.unidades += item.unidades;
  } else {
    items.push({ tipo: "pieza", ...item });
  }
  write(items);
  return items;
}

export function updateCartQuantity(numero: string, unidades: number): CartTiendaItem[] {
  const items = read()
    .map((i) => (i.numero === numero ? { ...i, unidades } : i))
    .filter((i) => i.unidades > 0);
  write(items);
  return items;
}

export function removeFromCart(numero: string): CartTiendaItem[] {
  const items = read().filter((i) => i.numero !== numero);
  write(items);
  return items;
}

export function clearCart(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCartTotalCents(): number {
  return read().reduce((sum, item) => sum + item.precioUnitarioCents * item.unidades, 0);
}
