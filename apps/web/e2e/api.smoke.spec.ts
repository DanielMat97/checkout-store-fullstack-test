import { test, expect } from '@playwright/test';

const apiBase = (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

test.describe('API smoke', () => {
  test('products list returns 200 with items', async ({ request }) => {
    const res = await request.get(`${apiBase}/products`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
  });

  test('security headers present on products', async ({ request }) => {
    const res = await request.get(`${apiBase}/products`);
    const headers = res.headers();
    expect(headers['x-content-type-options']?.toLowerCase()).toContain('nosniff');
    expect(headers['x-frame-options']?.toLowerCase()).toMatch(/deny|sameorigin/);
  });
});
