'use client'

import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function AccountPassword() {
  const [password, setPassword] = useState('')

  return (
    <div className='space-y-2'>
      <Input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button size='sm'>Update password</Button>
    </div>
  )
}
