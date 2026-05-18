import { Info } from 'lucide-react-native'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Screen } from './ui/screen'

export default function AccountErrorAlert() {
  return (
    <Screen className='items-center justify-center'>
      <Alert icon={Info} variant='destructive' className='mx-auto max-w-lg'>
        <AlertTitle className='font-bold'>Fetching profile failed.</AlertTitle>
        <AlertDescription>
          Your connection might be down or there is an error from our side. Try
          again after some time. Contact support if error persists.
        </AlertDescription>
      </Alert>
    </Screen>
  )
}
