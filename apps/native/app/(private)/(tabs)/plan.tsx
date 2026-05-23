import CurrentPlan from '@/components/current-plan'
import { Screen } from '@/components/ui/screen'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { ScrollView, View } from 'react-native'

export default function Page() {
  return (
    <Screen className='px-0 py-0 md:py-0'>
      <ScrollView>
        <View className='mx-auto w-full max-w-xl gap-4 px-8 py-4'>
          <CurrentPlan />
          <Separator />

          <Text className='text-center text-xs text-muted-foreground'>
            Billing and payments are managed securely.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  )
}
