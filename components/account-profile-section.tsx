'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import AccountAvatarSection from './account-avatar-section'
import { Separator } from './ui/separator'

export default function AccountProfileSection() {
  const [draft, setDraft] = useState({
    name: 'Sai Shravan',
    username: 'sai',
    bio: 'Building Chatly. Learning by shipping.',
  })

  const [saved] = useState(draft)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved)

  return (
    <section className='space-y-4'>
      <h2 className='text-lg font-semibold'>Profile</h2>
      <AccountAvatarSection />
      <Separator />

      <div className='space-y-4 md:flex md:gap-2 md:space-y-0'>
        <InputGroup>
          <InputGroupInput
            id='name'
            placeholder='John Doe'
            value={draft.name}
            onChange={(v) => setDraft((d) => ({ ...d, name: v.target.value }))}
          />
          <InputGroupAddon align='block-start'>
            <Label htmlFor='name' className='text-foreground'>
              Name
            </Label>
          </InputGroupAddon>
        </InputGroup>

        <InputGroup>
          <InputGroupInput
            id='username'
            placeholder='johndoe'
            value={draft.username}
            onChange={(v) =>
              setDraft((d) => ({ ...d, username: v.target.value }))
            }
          />
          <InputGroupAddon align='block-start'>
            <Label htmlFor='name' className='text-foreground'>
              Username
            </Label>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <InputGroup>
        <InputGroupTextarea
          id='bio'
          placeholder='This is your bio'
          className='min-h-25'
          value={draft.bio}
          onChange={(v) => setDraft((d) => ({ ...d, bio: v.target.value }))}
        />
        <InputGroupAddon align='block-start'>
          <Label htmlFor='bio' className='text-foreground'>
            Bio
          </Label>
        </InputGroupAddon>
      </InputGroup>

      <Button disabled={!isDirty} className='cursor-pointer'>
        Save
      </Button>
    </section>
  )
}
