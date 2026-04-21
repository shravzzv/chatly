import { PricingPlan } from '@/data/plans'
import type { Billing } from '@chatly/types/subscription'
import Link from 'next/link'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'

interface PricingCardProps {
  plan: PricingPlan
  billingCycle: Billing
  cta: {
    href: string
    label: string
  }
}

export default function PricingCard({
  plan,
  billingCycle,
  cta,
}: PricingCardProps) {
  return (
    <Card
      className={`transition hover:shadow-lg ${
        plan.name === 'Pro' && 'border-2 border-black dark:border-white'
      }`}
    >
      <CardHeader>
        <CardTitle className='flex items-center gap-4 text-2xl font-bold'>
          {plan.name}
          {plan.name === 'Pro' && <Badge>Most Popular</Badge>}
        </CardTitle>
        <CardDescription className='text-muted-foreground mt-2'>
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className='text-4xl font-extrabold'>
          ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
          <span className='text-muted-foreground text-xs font-normal'>
            /{billingCycle.slice(0, -2)}
          </span>
        </p>

        <Button
          asChild
          className='mt-6 w-full'
          variant={plan.name === 'Pro' ? 'default' : 'outline'}
        >
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </CardContent>

      <CardFooter>
        <ul className='space-y-2'>
          {plan.features.map((feature) => (
            <li key={feature} className='text-muted-foreground text-sm'>
              • {feature}
            </li>
          ))}
        </ul>
      </CardFooter>
    </Card>
  )
}
