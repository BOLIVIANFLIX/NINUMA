const STORAGE_KEY = "ninuma-cart-b2b";

export interface CartItem {
  numero: string;
  nombre: string;
  precioUnitario: number | null;
  unidades: number;
}

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCart(): CartItem[] {
  return read();
}

export function getCartCount(): number {
  return read().reduce((sum, item) => sum + item.unidades, 0);
}

export function addToCart(item: CartItem): CartItem[] {
  const items = read();
  const existing = items.find((i) => i.numero === item.numero);
  if (existing) {
    existing.unidades += item.unidades;
  } else {
    items.push(item);
  }
  write(items);
  return items;
}

export function updateCartQuantity(numero: string, unidades: number): CartItem[] {
  const items = read()
    .map((i) => (i.numero === numero ? { ...i, unidades } : i))
    .filter((i) => i.unidades > 0);
  write(items);
  return items;
}

export function removeFromCart(numero: string): CartItem[] {
  const items = read().filter((i) => i.numero !== numero);
  write(items);
  return items;
}

export function clearCart(): void {
  localStorage.removeItem(STORAGE_KEY);
}
