import FreePlanCard from '@/components/free-plan-card'
import { Screen } from '@/components/ui/screen'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

export default function Page() {
  return (
    <Screen className='mx-auto w-full max-w-xl gap-4'>
      <FreePlanCard />

      <Separator />

      <Text className='text-xs text-muted-foreground'>
        Billing and payments are managed securely.
      </Text>
    </Screen>
  )
}
