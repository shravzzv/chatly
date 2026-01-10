'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from './ui/label'

export default function AccountEmailInput() {
  const [email, setEmail] = useState('sai@example.com')

  return (
    <div className='space-y-2'>
      <InputGroup>
        <InputGroupInput
          id='email'
          placeholder='johndoe@mail.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputGroupAddon align='block-start'>
          <Label htmlFor='email' className='text-foreground'>
            Email
          </Label>
        </InputGroupAddon>
      </InputGroup>

      <p className='text-xs text-muted-foreground'>
        Requires confirmation email
      </p>
      <Button size='sm'>Update email</Button>
    </div>
  )
}
