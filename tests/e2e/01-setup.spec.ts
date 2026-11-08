import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { TEST_USER } from './fixtures';

test.describe.configure({ mode: 'serial' });

test('Ersteinrichtung legt das einzige Konto an', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Einrichtung nur einmal');
  await page.goto('/');
  await expect(page).toHaveURL(/\/setup$/);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(axe.violations.map((v) => `${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual(
    [],
  );

  await page.getByLabel('Dein Name').fill(TEST_USER.name);
  await page.getByLabel('Benutzername').fill(TEST_USER.username);
  await page.getByLabel('Passwort', { exact: true }).fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Konto anlegen' }).click();
  await expect(page.getByRole('heading', { name: 'Heute', level: 1 })).toBeVisible();
  await expect(page.getByText('Willkommen bei Pantry')).toBeVisible();
});

test('Registrierung ist danach geschlossen', async ({ page, request }) => {
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/login$/);
  const res = await request.post('/api/auth/sign-up/email', {
    headers: { origin: 'http://localhost:3100' },
    data: { name: 'Eve', email: 'eve@example.com', password: 'passwort12345', username: 'eve' },
  });
  expect(res.status()).toBe(403);
});

test('Anmeldung mit falschem und richtigem Passwort', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Benutzername').fill(TEST_USER.username);
  await page.getByLabel('Passwort', { exact: true }).fill('falsches-passwort');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByText('Benutzername oder Passwort stimmt nicht.')).toBeVisible();
  await page.getByLabel('Passwort', { exact: true }).fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByRole('heading', { name: 'Heute', level: 1 })).toBeVisible();
});

test('Ohne Anmeldung geht es zur Anmeldeseite', async ({ page }) => {
  await page.goto('/pantry');
  await expect(page).toHaveURL(/\/login$/);
});
