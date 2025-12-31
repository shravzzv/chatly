import { Page } from '@playwright/test'

export async function openChat(page: Page, username: string) {
  const chat = page.getByRole('button', { name: new RegExp(username) })
  await chat.waitFor({ state: 'visible' })
  await chat.click()
}
