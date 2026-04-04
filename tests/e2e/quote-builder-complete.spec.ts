import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function dismissWelcomeModal(page: import('@playwright/test').Page) {
  const acceptButton = page.getByRole('button', { name: /Ho compreso, inizia/i });

  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click();
  }
}

test('completes a preventivo with logo and exports a pdf', async ({ page }) => {
  await page.goto('/preventivo');
  await dismissWelcomeModal(page);

  await page.locator('#providerName').fill('Studio Gamma');
  await page.locator('#providerEmail').fill('info@studiogamma.it');
  await page.locator('#providerAddress').fill('Via Roma 10');
  await page.locator('#providerCity').fill('Milano');
  await page.locator('#providerVatNumber').fill('IT12345678901');
  await page.locator('#providerTaxCode').fill('STDGMM80A01F205X');
  await page.locator('#providerPhone').fill('+39 02 1234567');
  await page.locator('#providerWebsite').fill('https://studiogamma.it');

  await page.locator('#clientName').fill('Cliente Demo');
  await page.locator('#clientEmail').fill('cliente@example.com');
  await page.locator('#clientAddress').fill('Via Torino 20');
  await page.locator('#clientCity').fill('Torino');
  await page.locator('#clientVatNumber').fill('IT10987654321');
  await page.locator('#clientTaxCode').fill('CLNDMO80A01F205X');

  await page.locator('#quoteNumber').fill('PREV-2026-001');
  await page.locator('#title').fill('Sviluppo sito responsive');
  await page.locator('#offerValidity').fill('30 giorni');
  await page.locator('#deliveryTiming').fill('3 settimane');

  const logoInput = page.locator('input[type="file"]');
  await logoInput.setInputFiles({
    name: 'logo.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#111827"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="36">G</text></svg>',
    ),
  });

  const description = page.locator('#lineItems\\.0\\.description');
  await description.fill(
    'Progettazione e sviluppo front-end responsive con componenti riutilizzabili',
  );
  await page.locator('#lineItems\\.0\\.quantity').fill('1');
  await page.locator('#lineItems\\.0\\.unitPrice').fill('3200');

  await page.getByRole('button', { name: 'Aggiungi voce' }).click();
  const secondDescription = page.locator('#lineItems\\.1\\.description');
  await secondDescription.fill('Ottimizzazione accessibilità e test end-to-end');
  await page.locator('#lineItems\\.1\\.quantity').fill('1');
  await page.locator('#lineItems\\.1\\.unitPrice').fill('900');

  await page.locator('#discount').fill('5');
  await page.locator('#vatExemptionReason').fill('Regime IVA ordinario');
  await page.locator('#paymentBeneficiary').fill('Studio Gamma SRL');
  await page.locator('#paymentIban').fill('IT60X0542811101000000123456');
  await page.locator('#paymentBankName').fill('Banca Demo');
  await page.locator('#paymentInstructions').fill('50% anticipo, saldo a consegna');
  await page.locator('#causale').fill('Sviluppo preventivo demo');
  await page.locator('#notes').fill('Test e2e con logo e export finale.');

  await expect(page.getByTestId('quote-preview-root')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('quote-export-button').click();
  const download = await downloadPromise;

  const pdfPath = await download.path();
  expect(pdfPath).toBeTruthy();
  const pdfBytes = await readFile(pdfPath!);
  const pdfText = pdfBytes.toString('latin1');

  expect(pdfText).toContain('Studio Gamma');
  expect(pdfText).toContain('Cliente Demo');
  expect(pdfText).toContain('PREV-2026-001');

  expect(download.suggestedFilename()).toMatch(/^preventivo.*\.pdf$/i);
});
