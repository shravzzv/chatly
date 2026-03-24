// apps/native/app/(private)/dashboard/index.tsx
import { Screen } from '@/components/ui/screen'
import { Text } from '@/components/ui/text'
import { Link } from 'expo-router'

export default function Page() {
  return (
    <Screen>
      <Link href='/dashboard/johndoe'>
        <Text className='underline'>John doe</Text>
      </Link>

      <Link href='/dashboard/janedoe'>
        <Text className='underline'>Jane doe</Text>
      </Link>
    </Screen>
  )
}
