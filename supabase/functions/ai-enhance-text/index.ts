import '@supabase/functions-js/edge-runtime.d.ts'
import { checkAndIncUsage } from '../_shared/check-and-inc-usage.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { enhanceText } from './enhance-text.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } })
  }

  try {
    if (!Deno.env.get('AI_GATEWAY_API_KEY')) {
      throw Error('AI_GATEWAY_API_KEY environment variable not set.')
    }

    const body = await req.json()
    const text = body.text
    if (!text || typeof text !== 'string') {
      throw Error('Invalid text input argument')
    }

    /**
     * AI usage is incremented **before** making the ai enhancement.
     *
     * Unlike media uploads, AI calls incur cost even if they fail.
     * By checking and incrementing upfront, it is ensured that:
     * - Every attempted AI call is counted
     * - Failed generations do not bypass usage limits
     *
     * This keeps billing and usage enforcement accurate.
     */
    await checkAndIncUsage(req, 'ai')

    const enhancedText = await enhanceText(text)
    return new Response(JSON.stringify({ enhancedText }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)

      /**
       * Known errors are thrown with status 200 and are accessible via data.error in the client
       * because they represent business rule failures, not system failures.
       */
      return new Response(JSON.stringify({ error: error.message }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    console.error('Unhandled error:', error)
    return new Response('Internal Server Error', {
      status: 500,
      headers: { ...corsHeaders },
    })
  }
})
