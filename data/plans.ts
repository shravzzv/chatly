export type PricingPlanName = 'Free' | 'Pro' | 'Enterprise'

export interface PricingPlan {
  name: PricingPlanName
  priceMonthly: number
  priceYearly: number
  description: string
  features: string[]
}

export const PLANS: PricingPlan[] = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    description:
      'A complete 1:1 chat experience to get started. Perfect for everyday conversations with essential features.',
    features: [
      'User accounts & profiles',
      'Unlimited 1:1 text messages',
      'Message history',
      'Typing indicators',
      'Web push notifications',
      'PWA (installable app)',
      'Community support via Discord',
    ],
  },
  {
    name: 'Pro',
    priceMonthly: 10,
    priceYearly: 100,
    description:
      'Unlock richer conversations with media sharing and AI-powered message improvements.',
    features: [
      'Everything in Free',
      'Up to 5 media (image/audio/file) attachments per day',
      'Up to 5 AI-assisted message improvements per day',
    ],
  },
  {
    name: 'Enterprise',
    priceMonthly: 49,
    priceYearly: 490,
    description:
      'Higher usage limits for teams and power users. Designed to demonstrate extensibility, not enterprise sales.',
    features: [
      'Everything in Pro',
      'Up to 50 media attachments per day',
      'Up to 20 AI-assisted message improvements per day',
    ],
  },
]
