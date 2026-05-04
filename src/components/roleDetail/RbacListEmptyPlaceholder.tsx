import type { SxProps, Theme } from '@mui/material/styles'
import { Stack, Typography } from '@exotel-npm-dev/signal-design-system'

export type RbacListEmptyPlaceholderProps = {
  title: string
  description?: string
  /** More vertical padding + flex fill for drawer / grid shells */
  roomy?: boolean
  sx?: SxProps<Theme>
}

export function RbacListEmptyPlaceholder({
  title,
  description,
  roomy,
  sx,
}: RbacListEmptyPlaceholderProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={0.75}
      sx={[
        {
          py: roomy ? 5 : 2.5,
          px: 2,
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          ...(roomy ? { flex: 1, minHeight: 200 } : {}),
        },
        ...(sx ? [sx] : []),
      ]}
    >
      <Typography variant="title3" component="p" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, lineHeight: 1.43 }}>
          {description}
        </Typography>
      ) : null}
    </Stack>
  )
}

export function rbacQuotedSearch(q: string): string {
  const t = q.trim()
  return t ? `“${t}”` : ''
}
