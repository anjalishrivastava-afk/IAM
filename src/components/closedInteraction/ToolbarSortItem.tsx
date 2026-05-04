import * as React from 'react'
import type { GridSortDirection } from '@mui/x-data-grid-pro'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Tooltip from '@mui/material/Tooltip'
import InputBase from '@mui/material/InputBase'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha } from '@mui/material/styles'
import {
  Icon,
  ToolbarButton,
  gridColumnDefinitionsSelector,
  gridSortModelSelector,
  useGridApiContext,
  useGridSelector,
} from '@exotel-npm-dev/signal-design-system'

export function ToolbarSortItem() {
  const [open, setOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const apiRef = useGridApiContext()
  const fields = useGridSelector(apiRef, gridColumnDefinitionsSelector)
  const sortModel = useGridSelector(apiRef, gridSortModelSelector)
  const sortableFields = fields.filter((field) => field.sortable)
  const sortCount = sortModel.length
  const theme = useTheme()
  const [searchText, setSearchText] = React.useState('')
  const [highlightedField, setHighlightedField] = React.useState<string | null>(null)

  const groupedFields = React.useMemo(() => {
    const groups: Record<string, typeof sortableFields> = {
      'Frequently Used': [],
      Others: [],
    }
    const filteredFields = sortableFields.filter(
      (field) =>
        !searchText ||
        field.headerName?.toLowerCase().includes(searchText.toLowerCase()) ||
        field.field.toLowerCase().includes(searchText.toLowerCase()) ||
        (field as { description?: string }).description?.toLowerCase().includes(searchText.toLowerCase()),
    )

    filteredFields.forEach((field) => {
      const category = (field as { category?: string }).category || ''

      if (category && category !== '') {
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(field)
      } else {
        groups['Others'].push(field)
      }
    })
    return Object.fromEntries(Object.entries(groups).filter(([_, fields]) => fields.length > 0))
  }, [sortableFields, searchText])

  const handleSortChange = (field: string, sort: GridSortDirection) => {
    apiRef.current.sortColumn(field, sort, true)
  }

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true)
    setAnchorEl(event.currentTarget)
    setSearchText('')
  }

  const handleClose = () => {
    setOpen(false)
    setAnchorEl(null)
    setHighlightedField(null)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
  }

  const renderSortField = (field: {
    field: string
    headerName?: string
    sortable?: boolean
  }) => {
    const fieldIndexInSortModel = sortModel.findIndex((sort) => sort.field === field.field)
    const fieldInSortModel = sortModel[fieldIndexInSortModel]
    let nextSort: GridSortDirection = 'asc'

    if (fieldInSortModel) {
      nextSort = fieldInSortModel.sort === 'asc' ? 'desc' : null
    }

    const isHighlighted = highlightedField === field.field

    const nextActionText = !fieldInSortModel
      ? 'Sort A-Z'
      : fieldInSortModel.sort === 'asc'
        ? 'Sort Z-A'
        : 'Remove Sort'

    return (
      <ListItem
        key={field.field}
        sx={{ padding: 0, marginBlock: '5px' }}
        disablePadding
        onMouseEnter={() => setHighlightedField(field.field)}
        onMouseLeave={() => setHighlightedField(null)}
      >
        <ListItemButton
          onClick={() => handleSortChange(field.field, nextSort)}
          sx={{
            position: 'relative',
            py: '5px',
            transition: 'all 200ms ease-in-out',
            ...(fieldInSortModel && {
              bgcolor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.light, 0.12)
                  : alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.light, 0.18)
                    : alpha(theme.palette.primary.main, 0.12),
              },
            }),
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {fieldInSortModel ? (
              <Badge
                badgeContent={sortCount > 1 ? fieldIndexInSortModel + 1 : null}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    right: -5,
                    top: 3,
                    border: `2px solid ${theme.palette.background.paper}`,
                    padding: '0 4px',
                  },
                }}
              >
                {fieldInSortModel.sort === 'asc' ? (
                  <Icon size="sm" name="arrow-up" />
                ) : (
                  <Icon size="sm" name="arrow-down" />
                )}
              </Badge>
            ) : null}
          </ListItemIcon>
          <ListItemText
            primary={field.headerName || field.field}
            slotProps={{
              primary: {
                fontWeight: fieldInSortModel ? 600 : 500,
                variant: 'body2',
              },
            }}
          />

          {isHighlighted && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 0.5,
                py: 0.25,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                height: 20,
                ml: 0.5,
              }}
            >
              {!fieldInSortModel && <Icon size="xs" name="arrow-up" />}
              {fieldInSortModel?.sort === 'asc' && <Icon size="xs" name="arrow-down" />}
              {nextActionText}
            </Typography>
          )}
        </ListItemButton>
      </ListItem>
    )
  }

  const handleClearSearch = () => {
    setSearchText('')
  }

  const sortContent = (
    <Grid>
      <Grid sx={{ px: 1, py: 1, zIndex: 10 }}>
        <InputBase
          placeholder="Search"
          value={searchText}
          size="small"
          onChange={handleSearch}
          fullWidth
          startAdornment={
            <InputAdornment position="start">
              <Icon size="sm" name="magnifying-glass" />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch} sx={{ color: 'text.primary' }}>
                <Icon size="sm" name="x" />
              </IconButton>
            </InputAdornment>
          }
          sx={{
            px: 1,
            py: 0.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        />
      </Grid>

      <Grid sx={{ px: 1 }}>
        {Object.keys(groupedFields).length === 0 && (
          <Typography variant="body2" align="center" sx={{ py: 2, color: 'text.secondary' }}>
            No columns match search
          </Typography>
        )}
      </Grid>

      <List sx={{ pt: 0, width: '100%', px: 1 }}>
        {Object.entries(groupedFields).map(([category, fields]) => (
          <React.Fragment key={category || 'default'}>
            {fields.length > 0 && (
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: 'lightgrey',
                  padding: '8px 16px',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                {category}
              </Typography>
            )}
            {fields.map(renderSortField)}
          </React.Fragment>
        ))}
      </List>
    </Grid>
  )

  const desktopSortPopover = (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 412,
          maxWidth: '90vw',
          maxHeight: '80vh',
          borderRadius: '8px',
          boxShadow: theme.shadows[6],
          overflow: 'hidden',
        },
      }}
    >
      <Grid sx={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <Grid sx={{ flexGrow: 1, overflow: 'auto', maxHeight: '70vh' }}>{sortContent}</Grid>
      </Grid>
    </Popover>
  )

  return (
    <React.Fragment>
      <Tooltip title={sortCount > 0 ? `Sorted by ${sortCount} columns` : 'Sort data'}>
        <ToolbarButton
          onClick={handleOpen}
          size="small"
          className={`${sortCount > 0 ? 'Mui-active' : ''}`}
        >
          <Badge
            badgeContent={sortCount}
            color="primary"
            invisible={sortCount === 0}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: 10,
                height: 16,
                minWidth: 16,
                padding: 0,
              },
            }}
          >
            <Icon name="arrows-down-up" size="sm" />
          </Badge>
        </ToolbarButton>
      </Tooltip>
      {open && desktopSortPopover}
    </React.Fragment>
  )
}
