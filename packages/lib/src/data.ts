import type { Billing, Plan } from '@chatly/types/subscription'

export const LS_CUSTOMER_PORTAL_URL =
  'https://chatly-store.lemonsqueezy.com/billing'

export const SUPPORT_EMAIL = 'shravzzv@outlook.com'

export const DISCORD_SERVER_INVITE_URL = 'https://discord.gg/VdWBPWeVnm'

export const SUBREDDIT_URL = 'https://www.reddit.com/r/chatly_app'

export const MAX_MESSAGE_ATTACHMENT_SIZE = 50 * 1024 * 1024 // 50 mb

interface CheckoutLink {
  plan: Plan
  billing: Billing
  url: string
}

export const checkoutLinks: CheckoutLink[] = [
  {
    plan: 'pro',
    billing: 'monthly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/7387a8e5-60bd-4d46-b7e7-52f8376f76db',
  },
  {
    plan: 'pro',
    billing: 'yearly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/fa42cdcd-57f1-49a5-ab56-ff4b8d3941ea',
  },
  {
    plan: 'enterprise',
    billing: 'monthly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/a3cfbc86-3813-4ef6-9847-e4151d0607cf',
  },
  {
    plan: 'enterprise',
    billing: 'yearly',
    url: 'https://chatly-store.lemonsqueezy.com/buy/6ba00985-2df0-41c3-b014-931ac7bfbf9c',
  },
]
