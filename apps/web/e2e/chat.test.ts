import { test, expect } from '@playwright/test'
import { seedUser } from './utils/seed-user'
import { loginAsUser } from './utils/auth'
import { cleanupUsers } from './utils/cleanup'
import { randomUUID } from 'crypto'
import { openChat } from './utils/chat'

test.describe('Chat realtime messaging', () => {
  let userA: Awaited<ReturnType<typeof seedUser>>
  let userB: Awaited<ReturnType<typeof seedUser>>

  test.beforeEach(async () => {
    // Create two isolated test users with real auth + profiles
    userA = await seedUser('userA')
    userB = await seedUser('userB')
  })

  test.afterEach(async () => {
    // Clean up all test data to avoid polluting real environments
    await cleanupUsers([userA.id, userB.id])
  })

  test('two users can send and receive messages', async ({ browser }) => {
    test.slow() // for playwright UI, headless tests aren't affected

    // Unique message texts to avoid false positives from UI state or history
    const messageAToB = `e2e-A-${randomUUID()}`
    const messageBToA = `e2e-B-${randomUUID()}`

    // Two independent browser contexts = two real users
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    // Authenticate both users
    await loginAsUser(pageA, userA.email, userA.password)
    await loginAsUser(pageB, userB.email, userB.password)

    // User A sends a message to User B
    await openChat(pageA, userB.username)
    await pageA.getByPlaceholder('Type a message...').fill(messageAToB)
    await pageA.getByRole('button', { name: /send/i }).click()

    // User B receives the message in the chat window
    await openChat(pageB, userA.username)
    await expect(
      pageB.locator('[data-testid="message-list"]').getByText(messageAToB),
    ).toBeVisible()

    // User B replies to User A
    await pageB.getByPlaceholder('Type a message...').fill(messageBToA)
    await pageB.getByRole('button', { name: /send/i }).click()

    // Reload ensures persistence + server-backed state (not just realtime)
    await pageA.reload()
    await openChat(pageA, userB.username)

    // User A receives the reply in the message pane
    await expect(
      pageA.locator('[data-testid="message-list"]').getByText(messageBToA),
    ).toBeVisible()
  })
})
