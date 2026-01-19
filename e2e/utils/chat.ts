import { Page } from '@playwright/test'

/**
 * Opens a chat conversation with the specified user.
 *
 * This helper waits for the chat entry to become visible
 * before interacting with it, ensuring stability against
 * async rendering and slow network conditions.
 *
 * It assumes the user is already authenticated and
 * on a page where the chat list is present.
 */
export async function openChat(page: Page, username: string) {
  const chat = page.getByRole('button', { name: new RegExp(username) })
  await chat.waitFor({ state: 'visible' })
  await chat.click()
}
