import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Pen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AccountAvatarSection() {
  const avatarSrc = '/landing-hero.jpg'
  const avatarFallback = 'AV'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  }

  return (
    <div className='flex items-center gap-4'>
      <Input
        id='avatar'
        type='file'
        accept='image/*'
        className='sr-only'
        onChange={handleChange}
      />

      <Label
        htmlFor='avatar'
        className='relative cursor-pointer group shrink-0'
      >
        <Avatar className='h-16 w-16 object-cover'>
          <AvatarImage src={avatarSrc} alt='Avatar' />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>

        <div className='absolute inset-0 rounded-full bg-black/text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition'>
          <Pen />
        </div>
      </Label>

      <div className='text-sm text-muted-foreground'>
        Click avatar to upload a new image
      </div>
    </div>
  )
}
