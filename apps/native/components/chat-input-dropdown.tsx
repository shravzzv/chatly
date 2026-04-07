import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import {
  AudioLines,
  BookAudio,
  Camera,
  FilePlay,
  Image,
  ImagePlus,
  Mic,
  Paperclip,
  Plus,
  Video,
} from 'lucide-react-native'
import { toast } from 'sonner-native'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface ChatInputDropdownProps {
  startRecordingVoice: () => void
}

export default function ChatInputDropdown({
  startRecordingVoice,
}: ChatInputDropdownProps) {
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      toast.info('Camera permission is required')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 1,
    })

    if (!result.canceled) {
      const image = result.assets[0]
      console.log(image)
      toast.success('Photo taken')
    }
  }

  const takeVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      toast.info('Video permission is required')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'videos',
      allowsEditing: false,
      quality: 1,
    })

    if (!result.canceled) {
      const video = result.assets[0]
      console.log(video)
      toast.success('Video taken')
    }
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      toast.info('Image permissions are required')
      return
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
    })

    if (!result.canceled) {
      const image = result.assets[0]
      console.log(image)
      toast.success('Image uploaded')
    }
  }

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      toast.info('Video permissions are required')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
    })

    if (!result.canceled) {
      const video = result.assets[0]
      console.log(video)
      toast.success('Video picked')
    }
  }

  const recordAudio = () => {
    startRecordingVoice()
  }

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' })

    if (!result.canceled) {
      const file = result.assets[0]
      console.log(file)
      toast.success('Audio picked')
    }
  }

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync()

    if (!result.canceled) {
      const file = result.assets[0]
      console.log(file)
      toast.success('File picked')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='secondary'
          size='icon'
          className='mb-1 shrink-0 rounded-full'
        >
          <Icon as={Plus} className='size-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' side='top'>
        <DropdownMenuLabel>
          <Text className='text-xs text-muted-foreground'>Attachments</Text>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <Text className='text-xs text-muted-foreground'>0/50 today</Text>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='flex cursor-pointer items-center gap-2'>
            <Icon as={ImagePlus} className='size-4 text-muted-foreground' />
            <Text>Image</Text>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={takePhoto}
            >
              <Icon as={Camera} className='size-4 text-muted-foreground' />
              <Text>Camera</Text>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={pickImage}
            >
              <Icon as={Image} className='size-4 text-muted-foreground' />
              <Text>File</Text>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='flex cursor-pointer items-center gap-2'>
            <Icon as={Video} className='size-4 text-muted-foreground' />
            <Text>Video</Text>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={takeVideo}
            >
              <Icon as={Video} className='size-4 text-muted-foreground' />
              <Text>Record</Text>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={pickVideo}
            >
              <Icon as={FilePlay} className='size-4 text-muted-foreground' />
              <Text>File</Text>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='flex cursor-pointer items-center gap-2'>
            <Icon as={AudioLines} className='size-4 text-muted-foreground' />
            <Text>Audio</Text>
          </DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={recordAudio}
            >
              <Icon as={Mic} className='size-4 text-muted-foreground' />
              <Text>Record</Text>
            </DropdownMenuItem>

            <DropdownMenuItem
              className='flex cursor-pointer items-center gap-2'
              onPress={pickAudio}
            >
              <Icon as={BookAudio} className='size-4 text-muted-foreground' />
              <Text>File</Text>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          className='flex cursor-pointer items-center gap-2'
          onPress={pickFile}
        >
          <Icon as={Paperclip} className='size-4 text-muted-foreground' />
          <Text>File</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
