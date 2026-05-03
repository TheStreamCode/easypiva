import { expect, test } from '@playwright/test';

async function dismissWelcomeModal(page: any) {
  const acceptButton = page.getByRole('button', { name: /Ho compreso, inizia/i });

  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

test('renders the main public pages', async ({ page }) => {
  await page.goto('/');
  await dismissWelcomeModal(page);

  await expect(page.getByText('Calcolatore Forfettario')).toBeVisible();
  await expect(page.getByText('Confronto Regimi')).toBeVisible();
  await expect(page.getByText('Contributi INPS')).toBeVisible();
  await expect(page.getByText('Pianificazione')).toBeVisible();
  await expect(page.getByText('Preventivo')).toBeVisible();
  await expect(page.getByText('Informativa')).toBeVisible();

  const routes = [
    ['/calcolatore', /Calcolatore Forfettario/i],
    ['/confronto', /Confronto Regimi 2026/i],
    ['/contributi', /Contributi INPS 2026/i],
    ['/quanto-fatturare', /Quanto Fatturare/i],
    ['/pianificazione', /Pianificazione Previsionale/i],
    ['/informativa', /Informativa e Privacy/i],
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await dismissWelcomeModal(page);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
});

test('exports a preventivo pdf from the preview page', async ({ page }) => {
  await page.goto('/preventivo');
  await dismissWelcomeModal(page);

  await expect(page.getByTestId('quote-preview-root')).toBeVisible();
  await expect(page.getByTestId('quote-export-button')).toBeVisible();

  await page.locator('#providerName').fill('Studio Smoke');
  await page.locator('#providerEmail').fill('smoke@example.com');
  await page.locator('#providerAddress').fill('Via Smoke 1');
  await page.locator('#providerCity').fill('Roma');
  await page.locator('#providerVatNumber').fill('IT12345678901');
  await page.locator('#clientName').fill('Cliente Smoke');
  await page.locator('#clientEmail').fill('cliente-smoke@example.com');
  await page.locator('#clientAddress').fill('Via Cliente 2');
  await page.locator('#quoteNumber').fill('SMOKE-001');
  await page.locator('#title').fill('Preventivo smoke');
  await page.locator('#lineItems\\.0\\.description').fill('Servizio smoke test');
  await page.locator('#lineItems\\.0\\.unitPrice').fill('100');

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('quote-export-button').click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^preventivo.*\.pdf$/i);
});
