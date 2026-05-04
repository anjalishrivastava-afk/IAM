/**
 * Drawer bulk actions — avoids repurposing SDS “bulk delete” row (always error + trash).
 */
import { Box, Button, Stack } from '@exotel-npm-dev/signal-design-system'
import { useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

export type BulkDrawerActionKind = 'assign' | 'remove'

export interface BulkDrawerSelectionToolbarProps {
  visible: boolean
  kind: BulkDrawerActionKind
  selectedCount: number
  nounSingular: string
  nounPlural: string
  onConfirm: () => void
  onDiscard: () => void
}

export function BulkDrawerSelectionToolbar({
  visible,
  kind,
  selectedCount,
  nounSingular,
  nounPlural,
  onConfirm,
  onDiscard,
}: BulkDrawerSelectionToolbarProps) {
  const theme = useTheme()

  const primaryMain = (theme.vars?.palette?.primary?.main ?? theme.palette.primary.main) as string

  if (!visible || selectedCount <= 0) return null

  const labelUnit = selectedCount === 1 ? nounSingular : nounPlural
  const label =
    kind === 'assign'
      ? `Assign ${selectedCount} ${labelUnit}`
      : `Remove ${selectedCount} ${labelUnit}`

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        mx: -2,
        mb: -1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: (t: Theme) =>
          t.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.03)' : t.palette.action.hover,
      }}
    >
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        <Button
          variant="outlined"
          color={kind === 'assign' ? 'primary' : 'error'}
          size="small"
          startIconProps={{
            name: kind === 'assign' ? 'plus' : 'user-minus',
            size: 'sm',
          }}
          sx={{ textTransform: 'none', fontWeight: 600 }}
          onClick={onConfirm}
        >
          {label}
        </Button>
        <Button
          variant="text"
          size="small"
          sx={{ textTransform: 'none', fontWeight: 500 }}
          startIconProps={{
            name: 'x',
            weight: 'bold',
            color: primaryMain,
            size: 'sm',
          }}
          onClick={onDiscard}
        >
          Discard
        </Button>
      </Stack>
    </Box>
  )
}
