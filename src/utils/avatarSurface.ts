import { darken } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

/**
 * Background for circular initials avatars derived from DS `stringToColor()` output.
 * Lighter chroma fills than aggressive black mixes; white text lands around ~≥4.5:1 typical hues.
 */
export function avatarFillFromHue(hueHex: string, theme: Theme) {
  const amount = theme.palette.mode === 'light' ? 0.36 : 0.3
  return darken(hueHex, amount)
}
