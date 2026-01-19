import { Page, expect } from '@playwright/test'

/**
 * Logs in a user through the real authentication UI.
 *
 * This helper performs a full credential-based login flow,
 * ensuring cookies, sessions, and redirects behave exactly
 * as they would in production.
 *
 * The function resolves only after the user has successfully
 * reached the dashboard, making it safe to chain further
 * authenticated interactions.
 */
export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/signin')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()

  await expect(page).toHaveURL(/dashboard/)
}
