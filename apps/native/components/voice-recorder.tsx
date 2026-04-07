import { getFormattedSeconds } from '@/lib/date'
import { Pause, Play, Send, X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Text } from './ui/text'

interface VoiceRecorderProps {
  isRecording: boolean
  stopRecording: () => void
}

export default function VoiceRecorder({
  isRecording,
  stopRecording,
}: VoiceRecorderProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isRecording || isPaused) return

    intervalRef.current = setInterval(() => {
      setElapsedSecs((prev) => prev + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRecording, isPaused])

  const pause = () => {
    setIsPaused(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const play = () => {
    setIsPaused(false)
  }

  const cancel = () => {
    stopRecording()
  }

  const submit = () => {
    stopRecording()
  }

  return (
    <View className='mx-auto w-full max-w-sm flex-row items-center justify-between gap-4 rounded-full border border-border bg-secondary px-2 py-1.5'>
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
          onPress={() => (isPaused ? play() : pause())}
        >
          {isPaused ? (
            <Icon as={Play} className='size-4' />
          ) : (
            <Icon as={Pause} className='size-4' />
          )}
        </Button>
      </View>

      <View className='flex-1 flex-row items-center justify-evenly'>
        <Text className='text-xs text-muted-foreground'>
          {isPaused ? 'Paused' : 'Recording...'}
        </Text>
        <Text>{getFormattedSeconds(elapsedSecs)}</Text>
      </View>

      <Button size='icon' className='shrink-0 rounded-full' onPress={submit}>
        <Icon as={Send} className='size-4 text-primary-foreground' />
      </Button>
    </View>
  )
}
