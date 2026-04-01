import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { Pause, Play, RotateCcw } from 'lucide-react-native'
import { View } from 'react-native'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Progress } from './ui/progress'
import { Text } from './ui/text'

interface AudioAttachmentProps {
  signedUrl: string
}

export default function AudioAttachment({ signedUrl }: AudioAttachmentProps) {
  const player = useAudioPlayer(signedUrl, { updateInterval: 100 })
  const status = useAudioPlayerStatus(player)

  const handleRepeat = () => {
    player.seekTo(0)
    player.play()
  }

  const progressValue =
    status.duration > 0
      ? Math.min((status.currentTime / status.duration) * 100, 100)
      : 0

  return (
    <View className='flex-row items-center gap-2 rounded-full border border-border p-1 pr-2'>
      {status.playing ? (
        <Button
          size='icon'
          className='rounded-full'
          onPress={() => player.pause()}
        >
          <Icon as={Pause} className='text-primary-foreground' />
        </Button>
      ) : status.didJustFinish ? (
        <Button size='icon' className='rounded-full' onPress={handleRepeat}>
          <Icon as={RotateCcw} className='text-primary-foreground' />
        </Button>
      ) : (
        <Button
          size='icon'
          className='rounded-full'
          onPress={() => player.play()}
        >
          <Icon as={Play} className='text-primary-foreground' />
        </Button>
      )}

      <Text className='min-w-[60px] text-center text-xs text-muted-foreground'>
        {status.currentTime.toFixed(1)} / {status.duration.toFixed(1)} s
      </Text>

      <Progress
        style={{ width: 60 }}
        value={progressValue}
        className='cursor-not-allowed bg-muted'
      />
    </View>
  )
}
