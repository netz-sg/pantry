import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Abläufe einmal am Desktop');
  await login(page);
});

test('Rezept anlegen, ansehen und Fehlendes auf die Liste setzen', async ({ page }) => {
  await page.goto('/recipes/new');
  await page.getByLabel('Titel').fill('Testsuppe mit Möhren');
  await page.getByRole('button', { name: 'Zutat hinzufügen' }).click();
  await page.getByLabel('Menge, Zutat 1').fill('500');
  await page.getByLabel('Name, Zutat 1').fill('Möhren');
  await page.getByRole('button', { name: 'Schritt hinzufügen' }).click();
  await page.getByLabel('Schritt 1', { exact: true }).fill('Möhren weich kochen und pürieren.');
  await page.getByRole('button', { name: 'Sichern' }).first().click();

  await expect(page.getByRole('heading', { name: 'Testsuppe mit Möhren' })).toBeVisible();
  await expect(page.getByText('Möhren', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Auf die Liste' }).first().click();
  await expect(page.getByText(/auf der Einkaufsliste/).first()).toBeVisible();

  await page.goto('/shopping');
  await expect(page.getByRole('checkbox', { name: /Möhren/ })).toBeVisible();
});

test('Einkauf abhaken, abschließen und im Vorrat finden', async ({ page }) => {
  await page.goto('/shopping');
  const input = page.getByLabel('Neuer Eintrag, zum Beispiel 2 kg Kartoffeln');
  await input.fill('2 kg Kartoffeln');
  await input.press('Enter');
  const row = page.getByRole('checkbox', { name: /Kartoffeln/ });
  await expect(row).toHaveCount(1);
  await row.click();
  await expect(row).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('button', { name: 'Einkauf abschließen' }).click();
  await expect(page.getByText(/in den Vorrat/).first()).toBeVisible();

  await page.goto('/pantry');
  await expect(page.getByText('Kartoffeln').first()).toBeVisible();
});

test('Mahlzeit planen und Kochmodus öffnen', async ({ page }) => {
  await page.goto('/plan');
  await page
    .getByRole('button', { name: /Abend am .* planen/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: 'Mahlzeit planen' })).toBeVisible();
  await page
    .getByRole('button', { name: /Testsuppe mit Möhren/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Planen', exact: true }).click();
  await expect(page.getByText('Eingeplant').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^Testsuppe mit Möhren/ }).first()).toBeVisible();

  await page.goto('/recipes');
  await page.getByText('Testsuppe mit Möhren').first().click();
  await page.getByRole('link', { name: 'Kochmodus starten' }).click();
  await expect(page.getByText('Möhren weich kochen und pürieren.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fertig gekocht' })).toBeVisible();
});

test('Suche findet Rezepte über Zutaten', async ({ page }) => {
  await page.goto('/recipes?q=möhren');
  await expect(page.getByText('Testsuppe mit Möhren').first()).toBeVisible();
  await page.goto('/recipes?q=gibtesnicht');
  await expect(page.getByText('Nichts gefunden')).toBeVisible();
});
