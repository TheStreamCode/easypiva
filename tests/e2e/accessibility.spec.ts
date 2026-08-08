import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/calcolatore',
  '/confronto',
  '/contributi',
  '/quanto-fatturare',
  '/pianificazione',
  '/preventivo',
  '/informativa',
] as const;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    localStorage.setItem(
      'easypiva-disclaimer-storage',
      JSON.stringify({ state: { hasAcceptedDisclaimer: true }, version: 0 }),
    );
  });
});

for (const route of routes) {
  test(`${route} has no serious or critical automated accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.getByText('Caricamento...')).toBeHidden();
    await page.waitForTimeout(1_600);

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(({ impact }) =>
      ['serious', 'critical'].includes(impact ?? ''),
    );

    expect(blockingViolations).toEqual([]);
  });
}

test('mobile navigation behaves as a modal dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const trigger = page.getByRole('button', { name: 'Apri menu' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Menu di navigazione' });
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
