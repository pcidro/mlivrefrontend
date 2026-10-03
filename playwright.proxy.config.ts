import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/proxy',
  workers: 1,
  timeout: 30_000,
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
})
