'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from './ui/label'
import { Eye, EyeClosed } from 'lucide-react'

export default function AccountPasswordInput() {
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className='space-y-2'>
      <InputGroup>
        <InputGroupInput
          id='password'
          type={isVisible ? 'text' : 'password'}
          value={password}
          placeholder='••••••••'
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputGroupAddon align='block-start'>
          <Label htmlFor='password' className='text-foreground'>
            Password
          </Label>
          <InputGroupButton
            size='icon-xs'
            className='cursor-pointer'
            type='button'
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeClosed /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <p className='text-xs text-muted-foreground'>
        Must be atleast 8 characters long
      </p>
      <Button size='sm' className='cursor-pointer'>
        Update Password
      </Button>
    </div>
  )
}
