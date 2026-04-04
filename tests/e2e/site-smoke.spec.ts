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

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('quote-export-button').click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^preventivo.*\.pdf$/i);
});
