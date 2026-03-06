import Link from 'next/link'
import { Button } from './ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from './ui/card'

interface FreePlanCardProps {
  hideAction?: boolean
}

export default function FreePlanCard({ hideAction }: FreePlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl font-medium'>Free</CardTitle>
        {!hideAction && (
          <CardAction>
            <Button asChild>
              <Link href='/pricing'>Upgrade</Link>
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className='space-y-3'>
        <p className='text-muted-foreground text-sm'>
          A complete 1:1 chat experience to get started.
        </p>

        <ul className='text-muted-foreground list-disc space-y-1 pl-4 text-sm'>
          <li>Unlimited 1:1 text messages</li>
          <li>Message history</li>
          <li>Web push notifications</li>
          <li>Installable as a PWA</li>
        </ul>
      </CardContent>
    </Card>
  )
}
