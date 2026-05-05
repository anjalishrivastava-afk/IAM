import type { ChangeEvent, ComponentProps } from 'react'
import type { Theme } from '@mui/material/styles'
import {
  Box,
  Button,
  EnhancedTextField,
  Icon,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import { ChatWithAiButton } from './ChatWithAiButton'

type PrimaryProps = Omit<ComponentProps<typeof Button>, 'size'> & { id?: string }

export type RbacDataGridPageHeaderProps = {
  title?: string
  subtitle?: string
  primaryAction: PrimaryProps
  onChatWithAi: () => void
  showSearch?: boolean
  onBasicSearch?: (search: string) => void
}

/**
 * Mirrors Signal `PageHeader` chrome but keeps action order:
 * primary CTA → Chat with AI → search (requested RBAC UX).
 */
export function RbacDataGridPageHeader({
  title,
  subtitle,
  primaryAction,
  onChatWithAi,
  showSearch,
  onBasicSearch,
}: RbacDataGridPageHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: 'surface.elevation1',
        p: (theme: Theme) => theme.spacing(1.5, 2),
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box display="flex" flexDirection="column" gap={0.5} sx={{ flex: '1 1 200px' }}>
        {title ? <Typography variant="title3">{title}</Typography> : null}
        {subtitle ? <Typography variant="body2">{subtitle}</Typography> : null}
      </Box>

      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        gap={1.5}
        sx={{
          justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          flex: '2 1 280px',
        }}
      >
        <Button {...primaryAction} size="medium" />
        <ChatWithAiButton onClick={onChatWithAi} />
        {showSearch ? (
          <EnhancedTextField
            id={`rbac-grid-search-${primaryAction.id ?? 'default'}`}
            placeholder="Search"
            size="medium"
            onChange={(e: ChangeEvent<HTMLInputElement>) => onBasicSearch?.(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Icon name="magnifying-glass" size="sm" />,
              },
            }}
          />
        ) : null}
      </Box>
    </Box>
  )
}
