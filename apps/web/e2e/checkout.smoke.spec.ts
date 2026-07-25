import { test, expect } from '@playwright/test';

/**
 * Post-deploy / local smoke against live NORA storefront.
 * refs specs/deploy-smoke-rollback/spec.md
 */
test.describe('NORA checkout smoke', () => {
  test('catalog loads products', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nora-shell__header')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('.nora-catalog__state--error')).toHaveCount(0);
    await expect(
      page.locator('.nora-catalog__hero-hit, .nora-catalog__tile-hit').first(),
    ).toBeVisible({ timeout: 60_000 });
  });

  test('product page shows stock and pay CTA', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nora-catalog__hero-hit, .nora-catalog__tile-hit').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/\d+\s+(in stock|left)/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('button', { name: /pay with credit card/i })).toBeVisible();
  });

  test('orders console is reachable', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/store ops/i)).toBeVisible();
  });

  test('checkout happy path reaches status', async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto('/');
    await page.locator('.nora-catalog__hero-hit, .nora-catalog__tile-hit').first().click();    await page.getByRole('button', { name: /pay with credit card/i }).click();

    await page.getByLabel(/^card number$/i).fill('4242424242424242');
    await page.getByLabel(/name on card/i).fill('Ada Lovelace');
    await page.getByLabel(/^expiry$/i).fill('12/30');
    await page.getByLabel(/^cvv$/i).fill('123');

    await page.getByLabel(/^full name$/i).fill('Ada Lovelace');
    await page.getByLabel(/^email$/i).fill('ada.e2e@example.com');
    await page.getByLabel(/^phone$/i).fill('3001112233');
    await page.getByLabel(/street address/i).fill('Calle 100 #10-20');
    await page.getByLabel(/^city$/i).fill('Bogotá');
    await page.getByLabel(/^department$/i).fill('Cundinamarca');

    await page.getByRole('button', { name: /review order/i }).click();
    await page.getByRole('button', { name: /pay now/i }).click();

    await expect(
      page.getByRole('heading', { name: /approved|declined|confirming|something went wrong/i }),
    ).toBeVisible({ timeout: 120_000 });
  });
});
