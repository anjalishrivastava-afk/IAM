import type { ChangeEvent, ComponentProps } from 'react'
import type { Theme } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import {
  Box,
  Button,
  EnhancedTextField,
  Icon,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import { ChatWithAiButton } from './ChatWithAiButton'

type PrimaryProps = Omit<ComponentProps<typeof Button>, 'size'> & { id?: string }

export type RbacGridColumnSearchOption = { value: string; label: string }

export type RbacDataGridPageHeaderProps = {
  title?: string
  subtitle?: string
  primaryAction: PrimaryProps
  onChatWithAi: () => void
  /** Default true. Set false for sections without copilot (e.g. Users directory). */
  showChatWithAi?: boolean
  showSearch?: boolean
  onBasicSearch?: (search: string) => void
  /** Harmony-style search: pick column, then type in the adjacent field. */
  columnSearch?: {
    column: string
    columnOptions: RbacGridColumnSearchOption[]
    onColumnChange: (column: string) => void
    onSearchChange: (search: string) => void
    searchPlaceholder?: string
  }
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
  showChatWithAi = true,
  showSearch,
  onBasicSearch,
  columnSearch,
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
        {showChatWithAi ? <ChatWithAiButton onClick={onChatWithAi} /> : null}
        {showSearch ? (
          columnSearch ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ maxWidth: '100%', minWidth: { xs: '100%', sm: 360 } }}
            >
              <TextField
                id={`rbac-grid-col-${primaryAction.id ?? 'default'}`}
                select
                label="Search in"
                size="medium"
                value={columnSearch.column}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  columnSearch.onColumnChange(e.target.value)}
                sx={{
                  flex: '0 0 auto',
                  width: { xs: '100%', sm: 148 },
                  minWidth: { sm: 140 },
                  '& .MuiInputLabel-root': { typography: 'body2' },
                }}
              >
                {columnSearch.columnOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <EnhancedTextField
                key={columnSearch.column}
                id={`rbac-grid-search-${primaryAction.id ?? 'default'}`}
                label="Search"
                placeholder={columnSearch.searchPlaceholder ?? 'Type to filter'}
                size="medium"
                fullWidth
                sx={{ flex: '1 1 200px', minWidth: { xs: '100%', sm: 220 } }}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  columnSearch.onSearchChange(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <Icon name="magnifying-glass" size="sm" />,
                  },
                }}
              />
            </Stack>
          ) : (
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
          )
        ) : null}
      </Box>
    </Box>
  )
}
