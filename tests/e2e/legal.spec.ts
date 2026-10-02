import { test, expect } from '@playwright/test'
import { mockApi } from './fixtures'

test('documentos públicos funcionam sem sessão e com o backend indisponível', async ({ page }) => {
  const state = await mockApi(page, { authenticated: false, sessionUnavailable: true })
  await page.goto('/termos-de-uso')
  await expect(page.getByRole('heading', { name: 'Termos de uso', exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/termos-de-uso$/)
  await page.getByRole('navigation', { name: 'Informações e acesso' }).getByRole('link', { name: 'Política de privacidade' }).click()
  await expect(page.getByRole('heading', { name: 'Política de privacidade', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Política de privacidade', exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(state.runtimeErrors).toEqual([])
  expect(state.unexpected).toEqual([])
})
