import webpush from 'web-push'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Message } from '@/types/message'
import { getMessagePreview } from '@/lib/previews'

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

    /**
     * Rehydrate attachment if this message has one.
     * Webhook payload only includes the `messages` row.
     */
    let attachment = null

    const { data: attachmentRow, error: attachmentError } = await supabaseAdmin
      .from('message_attachments')
      .select('*')
      .eq('message_id', record.id)
      .maybeSingle()

    if (attachmentError) {
      console.warn(
        'Failed to fetch attachment for notification',
        attachmentError,
      )
    } else {
      attachment = attachmentRow ?? null
    }

    /**
     * Construct a minimal Message shape for preview derivation.
     * We do NOT need a full Message entity here.
     */
    const messageForPreview: Message = {
      id: record.id,
      text: record.text,
      sender_id: senderId,
      receiver_id: receiverId,
      created_at: record.created_at,
      updated_at: record.updated_at,
      attachment: attachment ?? undefined,
    }

    const title = 'New message'
    const body = getMessagePreview(messageForPreview)
    const icon = record.icon ?? undefined

    /**
     * Fetch all push subscriptions for the receiver.
     * RLS does not apply due to service role.
     */
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

    /**
     * Fan out push notifications to every active subscription.
     */
    await Promise.all(
      subs.map(async ({ subscription }) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title,
              body,
              icon,
              senderId,
              receiverId,
            }),
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
