import { Link } from 'expo-router'
import { View } from 'react-native'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Text } from './ui/text'

const freePlanHighlights: string[] = [
  'Unlimited 1:1 text messages',
  'Message history',
  'Web push notifications',
  'Installable as a PWA',
]

interface FreePlanCardProps {
  hideAction?: boolean
}

export default function FreePlanCard({ hideAction }: FreePlanCardProps) {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle className='font-bold text-xl'>Free</CardTitle>

        {!hideAction && (
          <Link href='/' asChild>
            <Button>
              <Text>Upgrade</Text>
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className='gap-4'>
        <Text className='text-sm text-muted-foreground'>
          A complete 1:1 chat experience to get started.
        </Text>

        <View className='space-y-1'>
          {freePlanHighlights.map((item, index) => (
            <View key={index} className='flex-row items-start'>
              <Text className='mr-2 text-sm text-muted-foreground'>
                {'\u2022'}
              </Text>

              <Text className='flex-1 text-sm text-muted-foreground'>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  )
}
