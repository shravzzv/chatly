import AccountAvatarSection from '@/components/account-avatar-section'
import AccountDangerZone from '@/components/account-danger-zone'
import AccountErrorAlert from '@/components/account-error-alert'
import AccountPreferences from '@/components/account-preferences'
import AccountProfileSection from '@/components/account-profile-section'
import AccountSecuritySection from '@/components/account-security-section'
import AccountPageSkeleton from '@/components/skeletons/account-page-skeleton'
import { Screen } from '@/components/ui/screen'
import { Separator } from '@/components/ui/separator'
import { usePrivateContext } from '@/providers/private-provider'
import { ScrollView, View } from 'react-native'

export default function Account() {
  const { profile, profilesError, profilesLoading } = usePrivateContext()

  if (profilesLoading) return <AccountPageSkeleton />
  if (profilesError || !profile) return <AccountErrorAlert />

  return (
    <Screen className='px-0 py-0 md:py-0'>
      <ScrollView>
        <View className='mx-auto w-full max-w-md gap-4 rounded-lg px-8 py-2'>
          <AccountAvatarSection profile={profile} />
          <Separator />
          <AccountProfileSection profile={profile} />
          <Separator />
          <AccountPreferences />
          <Separator />
          <AccountSecuritySection />
          <Separator />
          <AccountDangerZone />
        </View>
      </ScrollView>
    </Screen>
  )
}
