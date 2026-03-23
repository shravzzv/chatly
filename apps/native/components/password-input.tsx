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
  editable?: boolean
  placeholder?: string
}

export default function PasswordInput({
  value,
  inputRef,
  editable,
  className,
  placeholder = 'password',
  onChangeText,
  onSubmitEditing,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <View className='relative'>
      <Input
        id='password'
        ref={inputRef}
        value={value ?? ''}
        editable={editable}
        placeholder={placeholder}
        secureTextEntry={!visible}
        className={cn('pr-8', className)}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType='send'
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
