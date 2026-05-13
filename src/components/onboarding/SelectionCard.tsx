import type { KeyboardEvent, MouseEvent, ChangeEvent } from 'react'
import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { Box, Checkbox, Icon, Stack, Typography } from '@exotel-npm-dev/signal-design-system'

// ─── Role card (title + description, no icon) ────────────────────────────────

interface RoleCardProps {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}

export function RoleCard({ title, description, selected, onSelect }: RoleCardProps) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
  }
  return (
    <Box
      role="radio" aria-checked={selected} aria-selected={selected}
      tabIndex={0} onClick={onSelect} onKeyDown={handleKey}
      sx={(theme: Theme) => ({
        border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
        borderRadius: 2, p: 2, cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s', outline: 'none',
        '&:hover': { borderColor: theme.palette.primary.light },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, mb: 0.5, color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  )
}

// ─── Product card (gradient icon tile + title + description) ─────────────────

interface ProductCardProps {
  icon: string
  title: string
  description: string
  /** CSS gradient string — necessary as Signal has no gradient tokens */
  gradient: string
  selected: boolean
  onSelect: () => void
}

export function ProductCard({ icon, title, description, gradient, selected, onSelect }: ProductCardProps) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
  }
  return (
    <Box
      role="radio" aria-checked={selected} aria-selected={selected}
      tabIndex={0} onClick={onSelect} onKeyDown={handleKey}
      sx={(theme: Theme) => ({
        border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
        borderRadius: 2, p: 2, cursor: 'pointer',
        display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 1.5,
        transition: 'border-color 0.15s, background-color 0.15s', outline: 'none',
        '&:hover': { borderColor: theme.palette.primary.light },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: gradient, color: '#ffffff',
        }}
      >
        <Icon name={icon} size="sm" />
      </Box>
      <Stack spacing={0.25} sx={{ minWidth: 0, pt: 0.25 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.4, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, lineHeight: 1.5 }}>
          {description}
        </Typography>
      </Stack>
    </Box>
  )
}

// ─── Use-case row (label left, checkbox right) ────────────────────────────────

interface UseCaseRowProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function UseCaseRow({ label, checked, onChange }: UseCaseRowProps) {
  return (
    <Box
      onClick={() => onChange(!checked)}
      sx={(theme: Theme) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: `1px solid ${checked ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: checked ? alpha(theme.palette.primary.main, 0.04) : theme.palette.background.paper,
        borderRadius: 1.5, px: 2, py: 1.25, cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
        '&:hover': { borderColor: theme.palette.primary.light },
      })}
    >
      <Typography sx={{ fontSize: 14, color: 'text.primary', userSelect: 'none' }}>
        {label}
      </Typography>
      <Checkbox
        checked={checked}
        onChange={(e: ChangeEvent<HTMLInputElement>) => { e.stopPropagation(); onChange(e.target.checked) }}
        onClick={(e: MouseEvent) => e.stopPropagation()}
        size="small"
        aria-checked={checked}
        sx={{ p: 0.5 }}
      />
    </Box>
  )
}

// ─── Team-size chip (text only, single select) ────────────────────────────────

interface TeamSizeChipProps {
  label: string
  selected: boolean
  onSelect: () => void
}

export function TeamSizeChip({ label, selected, onSelect }: TeamSizeChipProps) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
  }
  return (
    <Box
      role="radio" aria-checked={selected} tabIndex={0}
      onClick={onSelect} onKeyDown={handleKey}
      sx={(theme: Theme) => ({
        border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
        borderRadius: 1.5, px: 2, py: 1.5, cursor: 'pointer', textAlign: 'center',
        transition: 'border-color 0.15s, background-color 0.15s', outline: 'none',
        '&:hover': { borderColor: theme.palette.primary.light },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      <Typography
        sx={{
          fontSize: 13, lineHeight: 1.4,
          fontWeight: selected ? 600 : 400,
          color: selected ? 'primary.main' : 'text.primary',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

// ─── Industry chip (icon + label, single select) ──────────────────────────────

interface IndustryChipProps {
  label: string
  icon: string
  selected: boolean
  onSelect: () => void
}

export function IndustryChip({ label, icon, selected, onSelect }: IndustryChipProps) {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
  }
  return (
    <Box
      role="radio" aria-checked={selected} tabIndex={0}
      onClick={onSelect} onKeyDown={handleKey}
      sx={(theme: Theme) => ({
        border: `1.5px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
        borderRadius: 1.5, px: 1.5, py: 1.25, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 1,
        transition: 'border-color 0.15s, background-color 0.15s', outline: 'none',
        '&:hover': { borderColor: theme.palette.primary.light },
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      <Box sx={{ color: selected ? 'primary.main' : 'text.secondary', display: 'flex', flexShrink: 0 }}>
        <Icon name={icon} size="sm" />
      </Box>
      <Typography
        sx={{
          fontSize: 13, lineHeight: 1.4,
          fontWeight: selected ? 600 : 400,
          color: selected ? 'primary.main' : 'text.primary',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
