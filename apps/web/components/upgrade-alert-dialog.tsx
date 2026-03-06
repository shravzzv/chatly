'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDashboardContext } from '@/providers/dashboard-provider'
import { Button } from './ui/button'
import { LS_CUSTOMER_PORTAL_URL } from '@/data/constants'
import Link from 'next/link'

export default function UpgradeAlertDialog() {
  const { plan, upgradeReason, closeUpgradeAlertDialog } = useDashboardContext()

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
    <AlertDialog
      open={open}
      onOpenChange={(open) => !open && closeUpgradeAlertDialog()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={closeUpgradeAlertDialog}
            className='cursor-pointer'
          >
            Close
          </AlertDialogCancel>

          {canUpgrade && (
            <AlertDialogAction asChild>
              <Button asChild className='cursor-pointer'>
                {plan === 'free' ? (
                  <Link href='/pricing'>Upgrade</Link>
                ) : (
                  <Link href={LS_CUSTOMER_PORTAL_URL}>Upgrade</Link>
                )}
              </Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
