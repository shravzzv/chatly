import '@supabase/functions-js/edge-runtime.d.ts'
import { checkAndIncUsage } from '../_shared/check-and-inc-usage.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createUserClient } from '../_shared/supabase-client.ts'
import { insertAttachment } from './insert-attachment.ts'

/**
 * The type of fileData sent in the request body.
 */
export interface FileData {
  path: string
  name: string
  size: number
  mimeType: string
}

/**
 * Edge function: create-msg-attachment
 *
 * PURPOSE
 * -------
 * Server-authoritative gate for the **paid + rate-limited message attachments feature**.
 *
 * This function does NOT upload files. Instead, it:
 * 1. Validates the request and ownership
 * 2. Enforces usage limits (billing + rate limiting)
 * 3. Persists the attachment record in the database
 *
 * WHY IT EXISTS
 * --------------
 * The client is untrusted. Without this layer, a user could:
 * - bypass usage limits (skip billing checks)
 * - attach files to messages they do not own
 * - attach arbitrary files already present in storage
 *
 * This function ensures that **only valid, authorized, billable attachments**
 * are committed to the database.
 *
 * TRUST MODEL
 * -----------
 * - File upload (storage) happens on the client → NOT trusted
 * - Database writes happen here → TRUSTED
 * - Usage enforcement happens here → TRUSTED
 *
 * ABUSE PREVENTION
 * ----------------
 * This function protects against:
 *
 * 1. Usage bypass:
 *    - Enforced via atomic RPC {@link checkAndIncUsage}
 *    - Prevents skipping limits or double-spending under concurrency
 *
 * 2. Unauthorized message access:
 *    - Verifies message exists
 *    - RLS + ownership guarantees prevent cross-user access
 *
 * 3. Arbitrary file attachment:
 *    - Enforces `path` structure: `${messageId}/...`
 *    - Prevents attaching files from other users or locations
 *
 * 4. Malformed input:
 *    - Validates required fields (`path`, `name`, `size`, `mimeType`)
 *
 * TRADEOFFS
 * ---------
 * - Usage is charged on "attempt", not success
 *   → protects infra from abuse but may count failed attempts
 *
 * - File upload happens before usage check
 *   → small abuse window (acceptable for MVP, fix with signed uploads later)
 *
 * FAILURE MODEL
 * -------------
 * - No cleanup is performed here
 * - Client owns rollback:
 *   - deletes message row
 *   - deletes uploaded file
 *
 * This keeps responsibility aligned:
 *  - creator cleans up its own side effects
 */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } })
  }

  try {
    const supabase = createUserClient(req)

    const body = await req.json()
    const messageId = body.messageId
    const fileData: FileData = body.fileData

    if (!messageId || !fileData) {
      throw Error('Invalid body')
    }

    if (
      !fileData.path ||
      !fileData.name ||
      !fileData.size ||
      !fileData.mimeType
    ) {
      throw Error('Invalid file data')
    }

    /**
     * Enforce storage namespace: file must belong to this message.
     * Prevents attaching arbitrary files from other locations.
     */
    if (!fileData.path.startsWith(messageId + '/')) {
      throw Error('Invalid file path')
    }

    /**
     * Ensure the message exists.
     * Ownership is enforced via RLS using the caller's JWT.
     */
    const { data: message, error } = await supabase
      .from('messages')
      .select('id, sender_id')
      .eq('id', messageId)
      .single()

    if (error || !message) throw Error('MESSAGE_NOT_FOUND')
    // RLS guarantees this message belongs to the authenticated user

    /** * Media usage is incremented **before** the attachment is committed to the DB.
     *
     * File upload happens on client and is NOT trusted.
     * This step enforces billing and limits at the point of persistence.
     *
     * Rationale:
     * - The database RPC performs an **atomic check + increment**
     * - This guarantees strict enforcement under concurrency
     * - Prevents abuse (e.g. repeated uploads bypassing limits)
     *
     * Tradeoff:
     * - Failed uploads will still count toward usage.
     *
     * This is intentional:
     * - **We treat an "attempt" as billable usage**
     * - This protects storage and bandwidth from abuse
     *
     * If perfect accuracy is needed in the future, * a reservation/commit model would be required.
     * */
    await checkAndIncUsage(req, 'media')

    const attachment = await insertAttachment(supabase, messageId, fileData)

    return new Response(JSON.stringify({ attachment }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error(error)

    if (error instanceof Error) {
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

    return new Response('Internal Server Error', {
      status: 500,
      headers: { ...corsHeaders },
    })
  }
})
