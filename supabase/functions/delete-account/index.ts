import { corsHeaders } from '../_shared/cors.ts'
import { createAdminClient } from '../_shared/supabase-admin.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } })
  }

  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      )
    }

    const jwt = authHeader.replace('Bearer ', '')

    const supabaseAdmin = createAdminClient()

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(jwt)

    if (authError || !user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      )
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
      throw Error('Failed to delete account', { cause: error })
    }

    const { error: avatarDeleteError } = await supabaseAdmin.storage
      .from('avatars')
      .remove([`${user.id}/avatar`])

    if (avatarDeleteError) {
      console.warn('Failed to delete avatar', avatarDeleteError)
    }

    return Response.json(
      { success: true },
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
