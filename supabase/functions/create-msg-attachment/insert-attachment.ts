import { type SupabaseClient } from '@supabase/supabase-js'
import { FileData } from './index.ts'

/**
 * Persists a message attachment record in the database.
 *
 * WHAT THIS DOES
 * --------------
 * - Inserts a row into `message_attachments`
 * - Links an already-uploaded file (via `path`) to a message
 *
 * WHAT THIS DOES NOT DO
 * ---------------------
 * - Does NOT upload the file (client responsibility)
 * - Does NOT enforce usage limits (handled before calling this)
 * - Does NOT perform cleanup on failure (caller decides rollback)
 *
 * TRUST MODEL
 * -----------
 * - `fileData` is treated as untrusted input
 * - Upstream caller (edge function) must validate:
 *   - ownership of the message
 *   - correctness of `path` (namespace enforcement)
 *   - usage limits
 *
 * SAFETY
 * ------
 * - Relies on RLS to ensure the authenticated user can only insert
 *   attachments for messages they own
 *
 * @param supabase - Authenticated Supabase client (with user JWT)
 * @param messageId - Target message ID
 * @param fileData - Metadata describing the uploaded file
 *
 * @returns Inserted attachment row
 *
 * @throws If the insert fails (caller must handle rollback)
 */
export async function insertAttachment(
  supabase: SupabaseClient,
  messageId: string,
  fileData: FileData,
) {
  const { data, error } = await supabase
    .from('message_attachments')
    .insert({
      message_id: messageId,
      path: fileData.path,
      file_name: fileData.name,
      size: fileData.size,
      mime_type: fileData.mimeType,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
