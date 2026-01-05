import { Button } from './ui/button'

export default function AccountDangerZone() {
  return (
    <section className='space-y-4 pt-6'>
      <h2 className='text-lg font-semibold text-red-500'>Danger zone</h2>
      <Button variant='destructive'>Delete account</Button>
    </section>
  )
}
