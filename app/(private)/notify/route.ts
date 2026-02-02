import webpush from 'web-push'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin client using the service role key (bypasses all RLS). This is safe because the route is server-side only.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

webpush.setVapidDetails(
  'mailto:saishravan384@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: Request) {
  try {
    const { record } = await req.json()

    const receiverId = record.receiver_id
    const senderId = record.sender_id
    const body = record.text // todo: update
    const title = 'New message' // todo: update
    const icon = record.icon ?? undefined

    // Read all push subscriptions for the receiver. RLS does not block this because we use the service role key.
    const { data: subs, error } = await supabaseAdmin
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

    // Send the notification to every active subscription.
    await Promise.all(
      subs.map(async ({ subscription }) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({ title, body, icon, receiverId, senderId }),
          )
        } catch (err) {
          console.error('Push send error:', err)
        }
      }),
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Notify route error:', err)
    return NextResponse.json({ ok: false, error: err })
  }
}
