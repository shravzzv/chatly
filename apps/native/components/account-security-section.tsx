import { View } from 'react-native'
import AccountEmailInput from './account-email-input'
import AccountEmailStatus from './account-email-status'
import AccountLogoutActions from './account-logout-actions'
import AccountPasswordInput from './account-password-input'
import { Text } from './ui/text'

export default function AccountSecuritySection() {
  return (
    <View className='my-4 gap-4'>
      <Text className='font-semibold text-lg'>Security</Text>
      <AccountEmailStatus />
      <AccountEmailInput />
      <AccountPasswordInput />
      <AccountLogoutActions />
    </View>
  )
}
