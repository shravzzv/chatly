import { getFormattedSeconds } from '@/lib/date'
import { usePrivateContext } from '@/providers/private-provider'
import { NativeFile } from '@/types/use-messages'
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio'
import { Pause, Play, Send, X } from 'lucide-react-native'
import { useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { toast } from 'sonner-native'
import { MAX_MESSAGE_ATTACHMENT_SIZE } from './chat-input-dropdown'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface VoiceRecorderProps {
  closeRecorder: () => void
}

export default function VoiceRecorder({ closeRecorder }: VoiceRecorderProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const audioRecorderState = useAudioRecorderState(audioRecorder)
  const { sendMessage, reflectUsageIncrement } = usePrivateContext()

  const record = useCallback(async () => {
    await audioRecorder.prepareToRecordAsync()
    audioRecorder.record()
  }, [audioRecorder])

  const checkRecordingStatus = () => {
    if (!audioRecorderState.canRecord) {
      toast.error('Unable to record audio')
      return false
    }
    return true
  }

  const pause = () => {
    if (!checkRecordingStatus()) return
    audioRecorder.pause()
  }

  const play = () => {
    if (!checkRecordingStatus()) return
    audioRecorder.record()
  }

  const cancel = async () => {
    if (!checkRecordingStatus()) {
      closeRecorder()
      return
    }

    await audioRecorder.stop()
    closeRecorder()
  }

  const submit = async () => {
    if (!checkRecordingStatus()) return
    if (!audioRecorder.uri) return

    await audioRecorder.stop()

    const arrayBuffer = await fetch(audioRecorder.uri).then((res) =>
      res.arrayBuffer(),
    )

    if (arrayBuffer.byteLength > MAX_MESSAGE_ATTACHMENT_SIZE) {
      toast.error('File must be at most 50 MB')
      closeRecorder()
      return
    }

    const mimeType = 'audio/mp4'
    const name = `recording_${Date.now()}.${mimeType?.split('/')[1]}`

    const file: NativeFile = {
      arrayBuffer,
      mimeType,
      name,
      size: arrayBuffer.byteLength,
    }

    await sendMessage({ file })
    reflectUsageIncrement('media')
    toast.success('Audio recording sent')
    closeRecorder()
  }

  useEffect(() => {
    ;(async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync()
      if (!status.granted) {
        toast.info('Permission to access microphone was denied')
        return
      }

      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      })

      // Start recording on mount after checking permissions.
      record()
    })()

    return () => {
      // Stop recording on dismount.
      if (audioRecorderState.isRecording) audioRecorder.stop()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='mx-auto w-full max-w-sm flex-row items-center justify-between rounded-full border border-border bg-secondary px-2 py-1.5'>
      <View className='shrink-0 flex-row items-center gap-1'>
        <Button
          variant='destructive'
          size='icon'
          className='rounded-full'
          onPress={cancel}
        >
          <Icon as={X} className='size-4 text-white' />
        </Button>

        <Button
          variant='ghost'
          size='icon'
          onPress={() => (audioRecorder.isRecording ? pause() : play())}
          className='cursor-pointer disabled:cursor-not-allowed'
        >
          {audioRecorder.isRecording ? (
            <Icon as={Pause} className='size-4' />
          ) : (
            <Icon as={Play} className='size-4' />
          )}
        </Button>
      </View>

      <View className='flex-1 flex-row items-center justify-evenly'>
        {audioRecorder.isRecording ? (
          <View className='flex-row items-center gap-1'>
            <View className='h-2 w-2 rounded-full bg-red-500' />
            <Text className='text-xs text-muted-foreground'>Recording...</Text>
          </View>
        ) : (
          <Text className='text-xs text-muted-foreground'>Paused</Text>
        )}
        <Text>
          {getFormattedSeconds(audioRecorderState.durationMillis / 1000)}
        </Text>
      </View>

      <Button size='icon' className='shrink-0 rounded-full' onPress={submit}>
        <Icon as={Send} className='size-4 text-primary-foreground' />
      </Button>
    </View>
  )
}
