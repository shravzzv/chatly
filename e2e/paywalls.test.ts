import { test, expect } from '@playwright/test'
import { seedUser } from './utils/seed-user'
import { seedSubscription } from './utils/seed-sub'
import { seedUsage } from './utils/seed-usage'
import { loginAsUser } from './utils/auth'
import { cleanupUsers } from './utils/cleanup'
import { openChat } from './utils/chat'
import { randomUUID } from 'crypto'
import { PLAN_LIMITS } from '@/data/plans'

/**
 * Paywalls & rate limiting — End-to-end coverage
 *
 * This suite validates plan-based feature access and daily usage limits
 * for AI enhancements and media attachments.
 *
 * These tests intentionally exercise the *full stack*:
 * - Real Supabase auth users
 * - Real subscription state
 * - Real usage window data
 * - Client-side gating logic
 * - Server-side enforcement (RPC + DB)
 *
 * Assertions are made exclusively through user-visible behavior
 * (dialogs, CTAs, rendered content), ensuring correctness at the
 * product level rather than implementation details.
 *
 * Coverage includes:
 * - Free users being paywalled
 * - Pro users succeeding within limits
 * - Pro users being paywalled after limits
 * - Enterprise users seeing limit exhaustion without upgrade CTAs
 *
 * NOTE:
 * Enterprise success paths are intentionally not tested.
 * Enterprise behavior only diverges at the paywall boundary,
 * which is fully covered here. Success paths are already exercised
 * by Pro + feature E2E tests.
 */
test.describe('Paywalls & rate limiting', () => {
  let userA: Awaited<ReturnType<typeof seedUser>>
  let userB: Awaited<ReturnType<typeof seedUser>>

  test.beforeEach(async () => {
    userA = await seedUser('paywall-A')
    userB = await seedUser('paywall-B')
  })

  test.afterEach(async () => {
    await cleanupUsers([userA.id, userB.id])
  })

  test.describe('AI message text enhacements', () => {
    test('Free user gets shown the upgrade alert dialog on clicking enhance', async ({
      page,
    }) => {
      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      await page.getByPlaceholder('Type a message...').fill('hello')
      await page.getByRole('button', { name: /enhance/i }).click()

      await expect(
        page.getByRole('heading', { name: /upgrade to access this feature/i }),
      ).toBeVisible()
      await expect(page.getByRole('link', { name: /^upgrade$/i })).toBeVisible()
    })

    test('Pro user can enhance a message succesfully within usage limit', async ({
      page,
    }) => {
      await seedSubscription({
        userId: userA.id,
        plan: 'pro',
        status: 'active',
      })

      await seedUsage({
        userId: userA.id,
        kind: 'ai',
        used: 0,
      })

      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      const originalMsg = `hi ${randomUUID()}`

      await page.getByPlaceholder('Type a message...').fill(originalMsg)
      await page.getByRole('button', { name: /enhance/i }).click()

      // ai enhancement might not modify the orginal message
      // asserting no paywall + UI returns to idle state
      await expect(page.getByRole('dialog', { name: /upgrade/i })).toBeHidden()
      await expect(page.getByRole('button', { name: /enhance/i })).toBeEnabled()
    })

    test('Pro user gets shown the upgrade alert dialog after reaching usage limit', async ({
      page,
    }) => {
      await seedSubscription({
        userId: userA.id,
        plan: 'pro',
        status: 'active',
      })

      await seedUsage({
        userId: userA.id,
        kind: 'ai',
        used: PLAN_LIMITS['pro'].ai,
      })

      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      await page.getByPlaceholder('Type a message...').fill('hello')
      await page.getByRole('button', { name: /enhance/i }).click()

      await expect(
        page.getByRole('heading', { name: /Upgrade to access this feature/i }),
      ).toBeVisible()
      await expect(page.getByRole('link', { name: /^upgrade$/i })).toBeVisible()
      // ! upgrade only visible in pro
    })

    test('Enterprise user sees usage limit reached with no upgrade CTA', async ({
      page,
    }) => {
      await seedSubscription({
        userId: userA.id,
        plan: 'enterprise',
        status: 'active',
      })

      await seedUsage({
        userId: userA.id,
        kind: 'ai',
        used: PLAN_LIMITS['enterprise'].ai,
      })

      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      await page.getByPlaceholder('Type a message...').fill('hello')
      await page.getByRole('button', { name: /enhance/i }).click()

      await expect(
        page.getByRole('heading', { name: /usage limit reached/i }),
      ).toBeVisible()
      await expect(page.getByText(/limits reset daily/i)).toBeVisible()
      await expect(page.getByRole('link', { name: /^upgrade$/i })).toBeHidden()
    })
  })

  test.describe('Media attachments', () => {
    test('Free user gets shown the upgrade alert dialog on sending a media attachment', async ({
      page,
    }) => {
      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      await page.getByLabel('Add attachment').click()
      await page.getByText('Image').click()

      await expect(
        page.getByRole('heading', { name: /upgrade to access this feature/i }),
      ).toBeVisible()
      await expect(page.getByRole('link', { name: /^upgrade$/i })).toBeVisible()
    })

    test('Pro user can send a media attachment succesfully within usage limit', async ({
      page,
    }) => {
      await seedSubscription({
        userId: userA.id,
        plan: 'pro',
        status: 'active',
      })

      await seedUsage({
        userId: userA.id,
        kind: 'media',
        used: 0,
      })

      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      await page.getByLabel('Add attachment').click()
      await page.getByText('Image').click()

      const imageInput = page.locator('input[type="file"][accept="image/*"]')
      await imageInput.setInputFiles({
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from([1, 2, 3]),
      })

      // Message with attachment should appear
      // It should be the only image attachment in the messages list
      await expect(
        page.locator('[data-testid="message-list"] img'),
      ).toBeVisible()
    })

    test('Pro user gets shown the upgrade alert dialog after reaching usage limit', async ({
      page,
    }) => {
      await seedSubscription({
        userId: userA.id,
        plan: 'pro',
        status: 'active',
      })

      await seedUsage({
        userId: userA.id,
        kind: 'media',
        used: PLAN_LIMITS['pro'].media,
      })

      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      await page.getByLabel('Add attachment').click()
      await page.getByText('Image').click()

      await expect(
        page.getByRole('heading', { name: /Upgrade to access this feature/i }),
      ).toBeVisible()
      await expect(page.getByRole('link', { name: /^upgrade$/i })).toBeVisible()
    })

    test('Enterprise user sees usage limit reached for media with no upgrade CTA', async ({
      page,
    }) => {
      await seedSubscription({
        userId: userA.id,
        plan: 'enterprise',
        status: 'active',
      })

      await seedUsage({
        userId: userA.id,
        kind: 'media',
        used: PLAN_LIMITS['enterprise'].media,
      })

      await loginAsUser(page, userA.email, userA.password)
      await openChat(page, userB.username)

      await page.getByLabel('Add attachment').click()
      await page.getByText('Image').click()

      await expect(
        page.getByRole('heading', { name: /usage limit reached/i }),
      ).toBeVisible()
      await expect(page.getByText(/limits reset daily/i)).toBeVisible()
      await expect(page.getByRole('link', { name: /^upgrade$/i })).toBeHidden()
    })
  })
})
