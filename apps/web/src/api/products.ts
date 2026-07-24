import { apiFetch } from './http';
import type { Product } from './types';

export async function fetchProducts(): Promise<Product[]> {
  const data = await apiFetch<{ items: Product[] }>('/products');
  return data.items ?? [];
}

export async function fetchProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${encodeURIComponent(id)}`);
}

export async function fetchProductStock(
  id: string,
): Promise<{ productId: string; stock: number }> {
  return apiFetch(`/products/${encodeURIComponent(id)}/stock`);
}
