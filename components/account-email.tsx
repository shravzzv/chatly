'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function AccountEmail() {
  const [email, setEmail] = useState('sai@example.com')

  return (
    <div className='space-y-2'>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />

      <Button size='sm'>Update email</Button>

      <p className='text-xs text-muted-foreground'>
        Requires confirmation email
      </p>
    </div>
  )
}
