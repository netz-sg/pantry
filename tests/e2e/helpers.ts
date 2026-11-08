import { expect, type Page } from '@playwright/test';
import { TEST_USER } from './fixtures';

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Benutzername').fill(TEST_USER.username);
  await page.getByLabel('Passwort', { exact: true }).fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByRole('heading', { name: 'Heute', level: 1 })).toBeVisible();
}
