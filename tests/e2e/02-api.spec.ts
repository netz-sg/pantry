import { expect, test, type APIRequestContext } from '@playwright/test';
import { TEST_USER } from './fixtures';

async function token(request: APIRequestContext) {
  const res = await request.post('/api/auth/sign-in/username', {
    headers: { origin: 'http://localhost:3100' },
    data: { username: TEST_USER.username, password: TEST_USER.password },
  });
  expect(res.ok()).toBeTruthy();
  return ((await res.json()) as { token: string }).token;
}

test('REST-API mit Bearer-Token', async ({ request }, info) => {
  test.skip(info.project.name !== 'desktop', 'API nur einmal prüfen');
  expect((await request.get('/api/v1/recipes')).status()).toBe(401);
  const t = await token(request);
  const auth = { authorization: `Bearer ${t}` };

  const created = await request.post('/api/v1/recipes', {
    headers: auth,
    data: {
      title: 'Linsen-Dal mit Spinat',
      servings: 4,
      prepMinutes: 10,
      cookMinutes: 25,
      tags: ['vegetarisch'],
      ingredients: [
        { name: 'Rote Linsen', amount: 250, unit: 'g' },
        { name: 'Kokosmilch', amount: 400, unit: 'ml' },
        { name: 'Babyspinat', amount: 150, unit: 'g' },
      ],
      steps: [{ text: 'Linsen mit Kokosmilch köcheln.', timerSeconds: 1200 }],
    },
  });
  expect(created.status()).toBe(200);
  const recipe = ((await created.json()) as { data: { id: string } }).data;

  const invalid = await request.post('/api/v1/recipes', { headers: auth, data: { title: '' } });
  expect(invalid.status()).toBe(422);
  expect(
    ((await invalid.json()) as { error: { fieldErrors: Record<string, string[]> } }).error.fieldErrors.title,
  ).toBeTruthy();

  const search = await request.get('/api/v1/recipes?q=spinat', { headers: auth });
  expect(((await search.json()) as { meta: { total: number } }).meta.total).toBe(1);

  await request.post('/api/v1/pantry', {
    headers: auth,
    data: { name: 'Rote Linsen', quantity: 500, unit: 'g' },
  });
  const missing = await request.post(`/api/v1/recipes/${recipe.id}/shopping`, {
    headers: auth,
    data: { mode: 'missing' },
  });
  expect(((await missing.json()) as { data: { added: number } }).data.added).toBe(2);

  const quick = await request.post('/api/v1/shopping', { headers: auth, data: { text: '2 kg Kartoffeln' } });
  expect(((await quick.json()) as { data: { aisle: string } }).data.aisle).toBe('produce');

  const plan = await request.post('/api/v1/plan', {
    headers: auth,
    data: { date: '2026-11-09', slot: 'dinner', recipeId: recipe.id, servings: 2 },
  });
  expect(plan.status()).toBe(200);
  const ics = await request.get('/api/v1/plan/calendar?from=2026-11-09&to=2026-11-15', { headers: auth });
  expect(await ics.text()).toContain('SUMMARY:Linsen-Dal mit Spinat');

  const spec = await request.get('/api/v1/openapi.json');
  expect(((await spec.json()) as { openapi: string }).openapi).toBe('3.1.0');
});

test('Rezept-Import blockt Adressen im lokalen Netz', async ({ request }, info) => {
  test.skip(info.project.name !== 'desktop', 'API nur einmal prüfen');
  const t = await token(request);
  for (const url of [
    'http://127.0.0.1:3100/api/health',
    'http://169.254.169.254/latest/meta-data',
    'http://localhost/',
  ]) {
    const res = await request.post('/api/v1/recipes/import', {
      headers: { authorization: `Bearer ${t}` },
      data: { url },
    });
    expect(res.status()).toBe(400);
  }
});
