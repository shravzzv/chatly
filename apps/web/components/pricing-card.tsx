import Link from 'next/link'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Badge } from './ui/badge'
import { Billing } from '@/types/subscription'
import { PricingPlan } from '@/data/plans'

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
        <CardTitle className='flex gap-4 items-center text-2xl font-bold'>
          {plan.name}
          {plan.name === 'Pro' && <Badge>Most Popular</Badge>}
        </CardTitle>
        <CardDescription className='mt-2 text-muted-foreground'>
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className='text-4xl font-extrabold'>
          ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
          <span className='text-xs text-muted-foreground font-normal'>
            /{billingCycle.slice(0, -2)}
          </span>
        </p>

        <Button
          asChild
          className='w-full mt-6'
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
