import { test, expect } from '@playwright/test'
import { seedUser } from './utils/seed-user'
import { loginAsUser } from './utils/auth'
import { cleanupUsers } from './utils/cleanup'
import { seedSubscription } from './utils/seed-sub'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'

test.describe('Billing flow', () => {
  let user: Awaited<ReturnType<typeof seedUser>>

  test.beforeEach(async () => {
    user = await seedUser('billing-user')
  })

  test.afterEach(async () => {
    await cleanupUsers([user.id])
  })

  test('unauth user is redirected to signup with pricing intent', async ({
    page,
  }) => {
    // Start unauthenticated
    await page.goto('/pricing')

    // Click Pro upgrade
    const proUpgrade = page.getByRole('link', { name: /get started/i }).nth(1)

    await proUpgrade.click()

    // Assert redirect to signup
    await expect(page).toHaveURL(/\/signup/)

    // Assert pricing intent is preserved
    const url = page.url()
    expect(url).toContain('plan=pro')
    expect(url).toContain('billing=monthly')
  })

  test('free user can navigate from plan → pricing → checkout', async ({
    page,
  }) => {
    await loginAsUser(page, user.email, user.password)

    // Visit plan page
    await page.goto('/plan')

    await expect(page.getByRole('heading', { name: /plan/i })).toBeVisible()

    // Upgrade CTA exists
    const upgradeButton = page.getByRole('link', {
      name: /upgrade/i,
    })
    await expect(upgradeButton).toBeVisible()

    // Navigate to pricing
    await upgradeButton.click()
    await expect(page).toHaveURL(/\/pricing/)

    // Pro plan checkout link exists
    const proCheckout = page.getByRole('link', { name: /upgrade/i }).first()
    const href = await proCheckout.getAttribute('href')

    expect(href).toMatch(/lemonsqueezy\.com\/buy/)
  })

  test('paid user sees paid plan card and manage billing CTA', async ({
    page,
  }) => {
    await seedSubscription({
      userId: user.id,
      plan: 'pro',
      status: 'active',
    })

    await loginAsUser(page, user.email, user.password)
    await page.goto('/plan')

    // Plan title
    await expect(page.getByText(/^pro/i)).toBeVisible()

    // Status badge
    await expect(page.getByText(/active$/i)).toBeVisible()

    // Paid feature highlights
    await expect(page.getByText(/media attachments/i)).toBeVisible()

    // Manage billing CTA
    const manageBilling = page.getByRole('link', {
      name: /manage billing/i,
    })

    await expect(manageBilling).toBeVisible()
    await expect(manageBilling).toHaveAttribute('href', LS_CUSTOMER_PORTAL_URL)
  })

  test('expired subscription shows demotion alert', async ({ page }) => {
    await seedSubscription({
      userId: user.id,
      plan: 'pro',
      status: 'expired',
      endsAt: new Date(Date.now() - 86400000).toISOString(),
    })

    await loginAsUser(page, user.email, user.password)
    await page.goto('/plan')

    await expect(page.getByRole('alert')).toBeVisible()

    await expect(page.getByText(/your paid plan has ended/i)).toBeVisible()

    const renew = page.getByRole('link', { name: /renew/i })
    await expect(renew).toHaveAttribute('href', LS_CUSTOMER_PORTAL_URL)
  })
})
