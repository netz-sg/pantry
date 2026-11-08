import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const DATA = './test-results/e2e-data';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    locale: 'de-DE',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'iphone', use: { ...devices['iPhone 15'], browserName: 'chromium' } },
  ],
  webServer: {
    command: `rm -rf ${DATA} && mkdir -p ${DATA} && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_PATH: `${DATA}/pantry.db`,
      UPLOAD_DIR: `${DATA}/uploads`,
      APP_URL: `http://localhost:${PORT}`,
      AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-only-secret-0123456789abcdefghijklmnop',
      BACKUP_DISABLED: '1',
      PANTRY_E2E: '1',
    },
  },
});
