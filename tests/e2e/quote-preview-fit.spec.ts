import { expect, test } from '@playwright/test';

async function dismissWelcomeModal(page: import('@playwright/test').Page) {
  const acceptButton = page.getByRole('button', { name: /Ho compreso, inizia/i });

  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

test('the preventivo page fits inside mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/preventivo');
  await dismissWelcomeModal(page);

  const previewPage = page.locator('[data-testid="quote-preview-root"] .quote-a4-page').first();
  await expect(previewPage).toBeVisible();

  const box = await previewPage.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.width).toBeLessThanOrEqual(390);
  expect(box!.height).toBeLessThanOrEqual(844);
});

test('the full-screen preventivo modal fits inside mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/preventivo');
  await dismissWelcomeModal(page);

  await page.getByRole('button', { name: /ingrandisci/i }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const modalPage = dialog.locator('.quote-a4-page').first();
  const box = await modalPage.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.width).toBeLessThanOrEqual(390);
  expect(box!.height).toBeLessThanOrEqual(844);
});
