import { Box } from '@exotel-npm-dev/signal-design-system'
import channelEmail from '../../assets/closedInteraction/channel-email.svg'
import channelVoice from '../../assets/closedInteraction/channel-voice.svg'
import channelWhatsapp from '../../assets/closedInteraction/channel-whatsapp.svg'

const wrapSx = { width: 24, height: 24, flexShrink: 0, lineHeight: 0 }

function ChannelImg({ src }: { src: string }) {
  return (
    <Box sx={wrapSx}>
      <img src={src} alt="" width={24} height={24} style={{ display: 'block', objectFit: 'contain' }} />
    </Box>
  )
}

export function VoiceChannelIcon() {
  return <ChannelImg src={channelVoice} />
}

export function EmailChannelIcon() {
  return <ChannelImg src={channelEmail} />
}

export function WhatsAppChannelIcon() {
  return <ChannelImg src={channelWhatsapp} />
}
