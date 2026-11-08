import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { login } from './helpers';

const PAGES = ['/', '/recipes', '/plan', '/shopping', '/pantry', '/settings'];

for (const scheme of ['light', 'dark'] as const) {
  test(`Hauptseiten ohne schwere Barrierefreiheits-Fehler (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await login(page);
    for (const path of PAGES) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(
        serious.map(
          (v) =>
            `${path} ${v.id} ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' ') + ' ' + (n.failureSummary ?? '').split('\n').slice(-1)[0])
              .join(' | ')}`,
        ),
        'Schwere Verstöße',
      ).toEqual([]);
    }
  });
}

test('Navigation passt zur Bildschirmbreite', async ({ page }, info) => {
  await login(page);
  if (info.project.name === 'iphone') {
    const tabs = page.getByRole('navigation', { name: 'Tabs' });
    await expect(tabs).toBeVisible();
    await tabs.getByRole('link', { name: 'Einkauf' }).click();
    await expect(page.getByRole('heading', { name: 'Einkauf', level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeHidden();
  } else {
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(nav).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Tabs' })).toBeHidden();
    await nav.getByRole('link', { name: 'Vorrat' }).click();
    await expect(page.getByRole('heading', { name: 'Vorrat', level: 1 })).toBeVisible();
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByPlaceholder('Rezepte, Zutaten oder Befehle suchen')).toBeVisible();
  }
});
