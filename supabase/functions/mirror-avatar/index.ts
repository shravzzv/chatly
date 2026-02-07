import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { upload } from './upload.ts'
import { updateProfile } from './update-profile.ts'
import { getBlob } from './get-blob.ts'

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    const body = await req.json()
    const record = body?.record

    if (!record?.avatar_url || !record?.user_id) {
      return new Response('No avatar_url or user_id found. Skipping.', {
        status: 200,
      })
    }

    const { avatar_url: avatarUrl, user_id: userId } = record

    const blob = await getBlob(avatarUrl)
    await upload(userId, blob)
    await updateProfile(userId)

    return new Response('Avatar mirrored successfully', { status: 200 })
  } catch (err) {
    console.error('Unhandled error in webhook handler:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
})