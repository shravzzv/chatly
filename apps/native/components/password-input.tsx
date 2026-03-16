import { cn } from '@/lib/utils'
import { Eye, EyeClosed } from 'lucide-react-native'
import { RefObject, useState } from 'react'
import { TextInput, View } from 'react-native'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Input } from './ui/input'

interface PasswordInputProps {
  value: string
  className?: string
  inputRef?: RefObject<TextInput | null>
  onChangeText: (value: string) => void
  onSubmitEditing?: () => void
}

export default function PasswordInput({
  value,
  inputRef,
  className,
  onChangeText,
  onSubmitEditing,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <View className='relative'>
      <Input
        id='password'
        value={value ?? ''}
        onChangeText={onChangeText}
        returnKeyType='send'
        secureTextEntry={!visible}
        placeholder='password'
        ref={inputRef}
        onSubmitEditing={onSubmitEditing}
        className={cn('pr-8', className)}
        autoComplete='password'
      />

      <Button
        variant='ghost'
        size='icon'
        onPress={() => setVisible((v) => !v)}
        className='absolute right-0'
      >
        <Icon as={visible ? EyeClosed : Eye} />
      </Button>
    </View>
  )
}
