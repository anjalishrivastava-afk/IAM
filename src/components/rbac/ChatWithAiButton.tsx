import { keyframes } from '@mui/material/styles'
import { useCallback, useEffect, useState, type AnimationEventHandler } from 'react'
import { Box, Button } from '@exotel-npm-dev/signal-design-system'

import sparkleIconUrl from '../../assets/chat-with-ai-sparkle.svg'

const BORDER_ANIM_MS = 1350

const gradientSweep = keyframes`
  0% {
    background-position: 0% 40%;
  }
  100% {
    background-position: 100% 60%;
  }
`

/** Multi-stop strokes (distinct hue shifts) swept once as the faux border. */
const CHAT_AI_RING_GRADIENT = [
  '#394FB6',
  '#5E79D5',
  '#9333EA',
  '#EC4899',
  '#0891B2',
  '#EA580C',
  '#CA8A04',
  '#22D3EE',
  '#394FB6',
].join(', ')

export type ChatWithAiButtonProps = {
  onClick: () => void
}

function SparkleLeadIcon() {
  return (
    <Box
      component="img"
      src={sparkleIconUrl}
      alt=""
      sx={{ width: 24, height: 24, display: 'block', flexShrink: 0 }}
      aria-hidden
    />
  )
}

/**
 * One-shot multi-color gradient ring on mount; then a standard neutral outlined button.
 */
export function ChatWithAiButton({ onClick }: ChatWithAiButtonProps) {
  const [ringDone, setRingDone] = useState(false)

  useEffect(() => {
    if (ringDone) return
    const t = window.setTimeout(() => setRingDone(true), BORDER_ANIM_MS + 350)
    return () => window.clearTimeout(t)
  }, [ringDone])

  const handleRingAnimationEnd = useCallback<AnimationEventHandler<HTMLDivElement>>((event) => {
    if (event.target !== event.currentTarget) return
    setRingDone(true)
  }, [])

  if (ringDone) {
    return (
      <Button
        type="button"
        variant="outlined"
        color="neutral"
        size="medium"
        startIcon={<SparkleLeadIcon />}
        onClick={onClick}
        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        Chat with AI
      </Button>
    )
  }

  return (
    <Box
      onAnimationEnd={handleRingAnimationEnd}
      sx={{
        borderRadius: 1,
        p: '1px',
        flexShrink: 0,
        alignSelf: 'flex-start',
        backgroundImage: `linear-gradient(105deg, ${CHAT_AI_RING_GRADIENT})`,
        backgroundSize: '420% 420%',
        backgroundPosition: '0% 40%',
        animation: `${gradientSweep} ${BORDER_ANIM_MS}ms ease-out forwards`,
      }}
    >
      <Button
        type="button"
        variant="outlined"
        color="neutral"
        size="medium"
        startIcon={<SparkleLeadIcon />}
        onClick={onClick}
        sx={{
          whiteSpace: 'nowrap',
          border: 'none',
          borderRadius: '6px',
          bgcolor: 'background.paper',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'action.hover',
            border: 'none',
            boxShadow: 'none',
          },
        }}
      >
        Chat with AI
      </Button>
    </Box>
  )
}
