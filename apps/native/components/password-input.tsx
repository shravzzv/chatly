import { Eye, EyeClosed } from 'lucide-react-native'
import { RefObject, useState } from 'react'
import { TextInput, View } from 'react-native'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Input } from './ui/input'

interface PasswordInputProps {
  value: string
  ref?: RefObject<TextInput | null>
  onChangeText: (value: string) => void
  onSubmitEditing?: () => void
}

export default function PasswordInput({
  ref,
  value,
  onChangeText,
  onSubmitEditing,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <View className='relative'>
      <Input
        id='password'
        value={value}
        onChangeText={onChangeText}
        returnKeyType='send'
        secureTextEntry={!visible}
        placeholder='password'
        maxLength={16}
        ref={ref}
        onSubmitEditing={onSubmitEditing}
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
