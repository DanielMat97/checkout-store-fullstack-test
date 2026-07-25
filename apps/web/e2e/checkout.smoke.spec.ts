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
    await page
      .locator('.nora-catalog__hero-hit, .nora-catalog__tile-hit')
      .first()
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/\d+\s+(in stock|left)/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('button', { name: /pay with credit card/i }).first(),
    ).toBeVisible();
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
    await page
      .locator('.nora-catalog__hero-hit, .nora-catalog__tile-hit')
      .first()
      .click();
    await page
      .getByRole('button', { name: /pay with credit card/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/checkout/, { timeout: 30_000 });

    // Prefer role+name: older builds nested trailing/hint inside <label>, so
    // accessible names became "Card number Card" / "CVV Show CVV".
    const cardNumber = page.getByRole('textbox', { name: /card number/i });
    await expect(cardNumber).toBeVisible({ timeout: 30_000 });
    await cardNumber.fill('4242424242424242');
    await page.getByRole('textbox', { name: /name on card/i }).fill('Ada Lovelace');
    await page.getByRole('textbox', { name: /^expiry$/i }).fill('12/30');
    await page.getByRole('textbox', { name: /^cvv/i }).fill('123');

    await page.getByRole('textbox', { name: /^full name$/i }).fill('Ada Lovelace');
    await page.getByRole('textbox', { name: /^email/i }).fill('ada.e2e@example.com');
    await page.getByRole('textbox', { name: /^phone/i }).fill('3001112233');
    await page.getByRole('textbox', { name: /street address/i }).fill('Calle 100 #10-20');
    await page.getByRole('combobox', { name: /^city$/i }).fill('Bogotá');
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: /^department$/i }).fill('Cundinamarca');
    await page.keyboard.press('Escape');
    await page.getByRole('heading', { name: /^checkout$/i }).click();

    await page.getByRole('button', { name: /review order/i }).click();
    await expect(page).toHaveURL(/\/summary/, { timeout: 30_000 });
    await page.getByRole('button', { name: /pay now/i }).click();
    await expect(page).toHaveURL(/\/status/, { timeout: 30_000 });

    await expect(
      page.getByRole('heading', {
        name: /approved|declined|confirming|something went wrong/i,
      }),
    ).toBeVisible({ timeout: 120_000 });
  });
});
