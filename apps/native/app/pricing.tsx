import PricingCard from '@/components/pricing-card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/providers/auth-provider'
import {
  PLANS,
  getCTAState,
  getEffectiveSubscription,
} from '@chatly/lib/billing'
import type { Billing, Subscription } from '@chatly/types/subscription'
import { Link } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'

export default function Page() {
  const [billingCycle, setBillingCycle] = useState<Billing>('monthly')
  const [sub, setSub] = useState<Subscription | null>(null)
  const { userId, user } = useAuthContext()

  useEffect(() => {
    if (!userId || !supabase) return

    const getSubscriptions = async (): Promise<Subscription[]> => {
      if (!supabase) throw Error('Supabase client absent')

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return data
    }

    async function loadSub() {
      const subs = await getSubscriptions()
      const effectiveSub = getEffectiveSubscription(subs)
      if (effectiveSub) setSub(effectiveSub)
    }

    loadSub()
  }, [userId])

  return (
    <Screen>
      <ScrollView>
        <View className='items-center justify-center'>
          <Link href={'/plan'} className='mt-8 text-center' asChild>
            <Button>
              <Icon as={ArrowLeft} className='text-primary-foreground' />
              <Text>Back to plan</Text>
            </Button>
          </Link>

          <View className='gap-8 py-8'>
            <Text className='text-center text-4xl font-extrabold leading-snug tracking-tight sm:text-5xl md:text-6xl'>
              Simple, Transparent Pricing
            </Text>

            <Text className='mx-auto max-w-xl text-center text-base text-muted-foreground'>
              Start free. Upgrade as your team grows.
            </Text>

            <View className='items-center gap-4'>
              <View className='inline-flex flex-row items-center rounded-full border border-gray-300 p-1 dark:border-gray-700'>
                <Button
                  variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                  size='sm'
                  onPress={() => setBillingCycle('monthly')}
                  className='cursor-pointer rounded-full px-5'
                >
                  <Text>Monthly</Text>
                </Button>
                <Button
                  variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                  size='sm'
                  onPress={() => setBillingCycle('yearly')}
                  className='cursor-pointer rounded-full px-5'
                >
                  <Text>Yearly</Text>
                </Button>
              </View>

              <Text className='text-xs text-muted-foreground'>
                Save <Text className='font-semibold text-foreground'>20%</Text>{' '}
                with yearly billing
              </Text>
            </View>
          </View>

          <View className='mb-10 grid w-full max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {PLANS.map((plan) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                cta={getCTAState({
                  user,
                  sub,
                  billingCycle,
                  planName: plan.name,
                })}
                billingCycle={billingCycle}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
}
