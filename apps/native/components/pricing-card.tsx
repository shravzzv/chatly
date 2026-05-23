import { PricingPlan } from '@chatly/lib/billing'
import type { Billing } from '@chatly/types/subscription'
import * as Linking from 'expo-linking'
import { View } from 'react-native'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from './ui/card'
import { Text } from './ui/text'

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
        <View className='flex-row items-center gap-3'>
          <Text className='font-semibold text-2xl leading-normal'>
            {plan.name}
          </Text>

          {plan.name === 'Pro' && (
            <Badge>
              <Text>Most Popular</Text>
            </Badge>
          )}
        </View>

        <CardDescription className='text-muted-foreground'>
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Text className='text-4xl font-extrabold'>
          ${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
          <Text className='text-xs font-normal text-muted-foreground'>
            /{billingCycle.slice(0, -2)}
          </Text>
        </Text>

        <Button
          className='mt-6 w-full'
          variant={plan.name === 'Pro' ? 'default' : 'outline'}
          onPress={() => Linking.openURL(cta.href)}
        >
          <Text>{cta.label}</Text>
        </Button>
      </CardContent>

      <CardFooter>
        <View className='w-full gap-1.5'>
          {plan.features.map((feature) => (
            <Text key={feature} className='text-sm text-muted-foreground'>
              • {feature}
            </Text>
          ))}
        </View>
      </CardFooter>
    </Card>
  )
}
