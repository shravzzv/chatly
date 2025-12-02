interface Plan {
  name: 'Free' | 'Pro' | 'Enterprise'
  priceMonthly: number
  priceYearly: number
  description: string
  features: string[]
}

export const plans: Plan[] = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Get started with Chatly and explore the basics for free.',
    features: [
      'Text chat with basic AI model',
      '20 messages per day',
      'Up to 3 image chats per day',
      'No audio or video calls',
      '1 workspace',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    priceMonthly: 10,
    priceYearly: 100,
    description: 'Unlock advanced AI features, unlimited chats, and calls.',
    features: [
      'Everything in Free',
      'Unlimited messages & image chats',
      'Audio & video calls (up to 60 mins/session)',
      'Access to advanced AI models',
      'Up to 5 workspaces',
      'Custom prompts & saved chats',
      'Priority email support',
    ],
  },
  {
    name: 'Enterprise',
    priceMonthly: 49,
    priceYearly: 490,
    description:
      'Tailored solutions and premium support for large teams and organizations.',
    features: [
      'Everything in Pro',
      'Unlimited call duration',
      'Team & admin management dashboard',
      'Centralized billing',
      'Dedicated account manager',
      'Custom security & compliance options',
      'SLA & onboarding support',
    ],
  },
]
