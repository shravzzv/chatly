import { Page, expect } from '@playwright/test'

export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/signin')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()

  await expect(page).toHaveURL(/dashboard/)
}
