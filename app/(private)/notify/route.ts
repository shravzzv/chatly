import webpush from 'web-push'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

webpush.setVapidDetails(
  'mailto:saishravan384@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { record } = payload

    const receiverId = record.receiver_id
    const senderId = record.sender_id
    const body = record.text
    const title = 'New message'
    const icon = record.icon ?? undefined

    const supabase = await createClient()

    // Fetch all subscriptions for this user
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', receiverId)

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ ok: false, error: error.message })
    }

    if (!subs?.length) {
      return NextResponse.json({ ok: false, message: 'No subscriptions found' })
    }

    // Send a push notification to each subscription
    await Promise.all(
      subs.map(async ({ subscription }) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title,
              body,
              icon,
              receiverId,
              senderId,
            })
          )
        } catch (err) {
          console.error('Push send error:', err)
        }
      })
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Notify route error:', err)
    return NextResponse.json({ ok: false, error: err })
  }
}
