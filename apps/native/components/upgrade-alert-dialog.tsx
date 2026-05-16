import { usePrivateContext } from '@/providers/private-provider'
import { Link } from 'expo-router'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Text } from './ui/text'
export const LS_CUSTOMER_PORTAL_URL =
  'https://chatly-store.lemonsqueezy.com/billing'

export default function UpgradeAlertDialog() {
  const { plan, upgradeReason, closeUpgradeAlertDialog } = usePrivateContext()

  const open = upgradeReason !== null
  const canUpgrade = plan !== 'enterprise'
  const title = canUpgrade
    ? 'Upgrade to access this feature'
    : 'Usage limit reached'

  const description =
    upgradeReason === 'ai'
      ? plan === 'free'
        ? `AI-assisted message improvements aren't enabled on your current plan.`
        : `You've reached today's AI usage limit. Limits reset daily.`
      : plan === 'free'
        ? `Media attachments aren't enabled on your current plan.`
        : `You've reached today's media attachments limit. Limits reset daily.`

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !open && closeUpgradeAlertDialog()}
    >
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            className='cursor-pointer'
            onPress={closeUpgradeAlertDialog}
            asChild
          >
            <Button variant='outline'>
              <Text>Cancel</Text>
            </Button>
          </DialogClose>

          {canUpgrade && (
            <Link
              href={plan === 'free' ? '/plan' : LS_CUSTOMER_PORTAL_URL}
              asChild
            >
              <Button className='cursor-pointer'>
                <Text>Upgrade</Text>
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
