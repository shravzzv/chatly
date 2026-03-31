import { VideoView, useVideoPlayer } from 'expo-video'
import { View } from 'react-native'

interface VideoAttachmentProps {
  signedUrl: string
}

export default function VideoAttachment({ signedUrl }: VideoAttachmentProps) {
  const player = useVideoPlayer(signedUrl, (player) => {
    player.loop = true
    player.muted = true
  })

  return (
    <View className='w-full rounded-2xl bg-muted md:max-w-xs'>
      <VideoView
        player={player}
        contentFit='contain'
        fullscreenOptions={{ enable: true }}
        style={{
          borderRadius: 16,
          aspectRatio: 9 / 16,
        }}
      />
    </View>
  )
}
