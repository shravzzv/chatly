import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import SignoutForm from '@/components/signout-form'

export default async function Page() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div>
      <p>Hello {data.user.email}</p>
      <SignoutForm />
    </div>
  )
}
