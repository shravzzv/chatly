import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MessageCircle } from 'lucide-react'
import { DISCORD_SERVER_INVITE_URL, SUPPORT_EMAIL } from '@/data/constants'

export default function Page() {
  return (
    <main className='mx-auto max-w-2xl space-y-5 px-6 py-12'>
      <header className='space-y-2'>
        <h1 className='text-3xl font-semibold'>Support</h1>
        <p className='text-muted-foreground text-sm'>
          Need help with Chatly? You can contact support directly or join the
          community.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Contact support</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='flex items-start gap-3'>
            <Mail className='text-muted-foreground mt-0.5 h-5 w-5' />

            <div className='space-y-1'>
              <p className='font-medium'>Email</p>

              <p className='text-muted-foreground text-sm'>
                Contact support at{' '}
                <Link
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className='underline underline-offset-4'
                >
                  {SUPPORT_EMAIL}
                </Link>
              </p>

              <p className='text-muted-foreground text-xs'>
                Most messages receive a response within 24 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Community</CardTitle>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='flex items-start gap-3'>
            <MessageCircle className='text-muted-foreground mt-0.5 h-5 w-5' />
            <div className='space-y-2'>
              <p className='font-medium'>Discord</p>
              <p className='text-muted-foreground text-sm'>
                Join the Chatly Discord to ask questions, report bugs, or share
                feedback.
              </p>

              <Button asChild variant='secondary'>
                <Link
                  href={DISCORD_SERVER_INVITE_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Join Discord
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
