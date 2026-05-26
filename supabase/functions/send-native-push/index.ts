import { corsHeaders } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-admin.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } })
  }

  try {
    const { record: message } = await req.json()

    if (!message?.receiver_id) {
      throw Error('receiver_id missing')
    }

    const supabaseAdmin = createAdminClient()
    const { data: tokens, error } = await supabaseAdmin
      .from('expo_push_tokens')
      .select('token')
      .eq('user_id', message.receiver_id)

    if (error) throw error

    if (!tokens?.length) {
      return Response.json(
        { success: true, message: 'No push tokens' },
        { headers: corsHeaders },
      )
    }

    const uniqueTokens = [...new Set(tokens.map((t) => t.token))]

    const notifications = uniqueTokens.map((token) => ({
      to: token,
      sound: 'default',
      title: 'New message',
      body: message.text?.trim() ? message.text : 'Sent an attachment',
      data: {
        senderId: message.sender_id,
      },
    }))

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notifications),
    })

    if (!expoResponse.ok) {
      throw Error('Expo push send failed')
    }

    const expoData = await expoResponse.json()

    return Response.json(
      { success: true, expo: expoData },
      { status: 200, headers: corsHeaders },
    )
  } catch (error) {
    console.error(error)

    if (error instanceof Error) {
      return Response.json(
        { success: false, message: error.message },
        { status: 500, headers: corsHeaders },
      )
    }

    return Response.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500, headers: corsHeaders },
    )
  }
})
