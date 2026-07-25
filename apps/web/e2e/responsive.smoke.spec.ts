import { test, expect } from '@playwright/test';

/**
 * Formal responsive + multi-browser shell matrix (B2).
 * Breakpoints: SE ~375, tablet 768, desktop 1280.
 * refs docs/ux-evidence.md · specs/ux-quality-bar
 */
test.describe('Responsive shell matrix', () => {
  async function assertNoHorizontalOverflow(
    page: import('@playwright/test').Page,
    label: string,
  ) {
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflowX, label).toBeLessThanOrEqual(1);
  }

  test('no horizontal overflow on catalog / product / checkout / orders', async ({
    page,
  }, testInfo) => {
    const viewports = [
      { w: 375, h: 667, label: 'se' },
      { w: 768, h: 1024, label: 'tablet' },
      { w: 1280, h: 800, label: 'desktop' },
    ];

    for (const vp of viewports) {
      if (testInfo.project.name === 'chromium-se' && vp.w > 400) continue;

      await page.setViewportSize({ width: vp.w, height: vp.h });

      await page.goto('/');
      await expect(page.locator('.nora-shell')).toBeVisible({ timeout: 60_000 });
      await assertNoHorizontalOverflow(page, `catalog @ ${vp.label}`);

      await page.goto('/orders');
      await expect(page.locator('.nora-shell')).toBeVisible({ timeout: 60_000 });
      await assertNoHorizontalOverflow(page, `orders @ ${vp.label}`);

      await page.goto('/');
      const hit = page
        .locator('.nora-catalog__hero-hit, .nora-catalog__tile-hit')
        .first();
      await expect(hit).toBeVisible({ timeout: 60_000 });
      await hit.click();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
        timeout: 30_000,
      });
      await assertNoHorizontalOverflow(page, `product @ ${vp.label}`);

      await page.getByRole('button', { name: /pay with credit card/i }).click();
      await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });
      await expect(page.locator('.nora-flow, .nora-checkout').first()).toBeVisible({
        timeout: 20_000,
      });
      await assertNoHorizontalOverflow(page, `checkout @ ${vp.label}`);
    }
  });
});
