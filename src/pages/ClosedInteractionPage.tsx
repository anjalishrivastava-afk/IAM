/**
 * Closed Interaction — Data Grid, applied filters, and list view (Signal DS `DataGrid` default toolbar).
 * (see Storybook DataGrid list view: MUI `listView` + `listViewColumn`).
 *
 * Vertical alignment: custom `renderCell` content should use `Stack` with `height="100%"` and
 * `alignItems="center"` (see ExampleTablePage). The grid also sets flex + alignItems on cells below.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import type { GridListViewColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import type { GridSortModel } from '@mui/x-data-grid-pro'
import MenuItem from '@mui/material/MenuItem'
import useMediaQuery from '@mui/material/useMediaQuery'
import dayjs from 'dayjs'
import { alpha, useTheme, type Theme } from '@mui/material/styles'
import { avatarFillFromHue } from '../utils/avatarSurface'
import {
  Avatar,
  Box,
  Chip,
  DataGrid,
  Divider,
  Icon,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  Paper,
  Stack,
  stringToColor,
  Tooltip,
  Typography,
  getInitials,
  type DateRangeValue,
  type GridColDef,
  type IconName,
  type ToolbarFilterConfig,
} from '@exotel-npm-dev/signal-design-system'
import type { FilterRecords } from '../types/filterRecords'
import {
  EmailChannelIcon,
  VoiceChannelIcon,
  WhatsAppChannelIcon,
} from '../components/closedInteraction/ChannelIcons'
import {
  CLOSED_INTERACTION_ROWS,
  type ClosedInteractionRow,
  type ChannelType,
} from '../data/closedInteraction'
import { CLOSED_INTERACTION_NARROW_MAX_WIDTH_PX } from '../components/closedInteraction/closedInteractionConstants'

function tonalScoreSx(theme: Theme, tone: 'success' | 'warning' | 'error') {
  const palette = theme.palette[tone]
  const isDark = theme.palette.mode === 'dark'
  const bgAlpha = isDark ? 0.16 : 0.12
  return {
    backgroundColor: alpha(palette.main, bgAlpha),
    color: palette.main,
    boxShadow: 'none',
    fontWeight: theme.typography.fontWeightMedium,
    '& .MuiChip-label': { px: 1 },
  }
}

function buildToolbarFilterConfig(rows: ClosedInteractionRow[]): ToolbarFilterConfig[] {
  const campaigns = [...new Set(rows.map((r) => r.campaign.trim()))].sort()
  const queues = [...new Set(rows.map((r) => r.queue))].sort()
  const dispositions = [...new Set(rows.map((r) => r.disposition))].sort()
  const channelValues = [...new Set(rows.map((r) => r.channel))].sort()
  const channelLabel = (c: ChannelType) =>
    c === 'voice' ? 'Voice' : c === 'email' ? 'Email' : 'WhatsApp'
  const channelOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    ...channelValues.map((c) => ({ value: c, label: channelLabel(c) })),
  ]
  return [
    {
      id: 'creationDate',
      type: 'date-range',
      label: 'Creation Date',
      initialValue: { startDate: null, endDate: null },
    },
    {
      id: 'campaign',
      type: 'select',
      label: 'Campaign',
      initialValue: 'all',
      options: [{ value: 'all', label: 'All' }, ...campaigns.map((c) => ({ value: c, label: c }))],
    },
    {
      id: 'queue',
      type: 'select',
      label: 'Queue',
      initialValue: 'all',
      options: [{ value: 'all', label: 'All' }, ...queues.map((q) => ({ value: q, label: q }))],
    },
    {
      id: 'disposition',
      type: 'select',
      label: 'Disposition',
      initialValue: 'all',
      options: [{ value: 'all', label: 'All' }, ...dispositions.map((d) => ({ value: d, label: d }))],
    },
    {
      id: 'channel',
      type: 'select',
      label: 'Channel',
      initialValue: 'all',
      options: channelOptions,
    },
  ]
}

const INITIAL_TOOLBAR_FILTERS: FilterRecords = {
  creationDate: { startDate: null, endDate: null },
  campaign: 'all',
  queue: 'all',
  disposition: 'all',
  channel: 'all',
}

function applyToolbarAndSearch(
  rows: ClosedInteractionRow[],
  filters: FilterRecords,
  search: string,
): ClosedInteractionRow[] {
  let out = rows
  const q = search.trim().toLowerCase()
  if (q) {
    out = out.filter(
      (r) =>
        r.interactionIdFull.toLowerCase().includes(q) ||
        r.interactionIdShort.toLowerCase().includes(q) ||
        r.channelId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.channelDetail.includes(q) ||
        r.campaign.toLowerCase().includes(q),
    )
  }

  const dr = filters.creationDate as DateRangeValue | undefined
  if (dr?.startDate && dr?.endDate) {
    const start = dr.startDate.startOf('day')
    const end = dr.endDate.endOf('day')
    out = out.filter((r) => {
      const d = dayjs(r.createdAt)
      return (d.isAfter(start) || d.isSame(start, 'day')) && (d.isBefore(end) || d.isSame(end, 'day'))
    })
  }

  const campaign = filters.campaign as string | undefined
  if (campaign && campaign !== 'all') {
    out = out.filter((r) => r.campaign.trim() === campaign)
  }

  const queue = filters.queue as string | undefined
  if (queue && queue !== 'all') {
    out = out.filter((r) => r.queue === queue)
  }

  const disposition = filters.disposition as string | undefined
  if (disposition && disposition !== 'all') {
    out = out.filter((r) => r.disposition === disposition)
  }

  const channel = filters.channel as string | undefined
  if (channel && channel !== 'all') {
    out = out.filter((r) => r.channel === channel)
  }

  return out
}

function ChannelCell({ channel }: { channel: ChannelType }) {
  const label = channel === 'voice' ? 'Voice' : channel === 'email' ? 'Email' : 'WhatsApp'
  return (
    <Stack direction="row" alignItems="center" spacing={1} height="100%" sx={{ minWidth: 0 }}>
      {channel === 'voice' ? (
        <VoiceChannelIcon />
      ) : channel === 'email' ? (
        <EmailChannelIcon />
      ) : (
        <WhatsAppChannelIcon />
      )}
      <Typography variant="body2" noWrap>
        {label}
      </Typography>
    </Stack>
  )
}

function DirectionCell({ direction }: { direction: 'inbound' | 'outbound' }) {
  const icon: IconName = direction === 'outbound' ? 'arrow-up-right' : 'arrow-down-left'
  const label = direction === 'outbound' ? 'Outbound' : 'Inbound'
  return (
    <Stack direction="row" alignItems="center" spacing={1} height="100%" sx={{ minWidth: 0 }}>
      <Icon name={icon} size="sm" />
      <Typography variant="body2" noWrap>
        {label}
      </Typography>
    </Stack>
  )
}

function TimeWithIcon({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} height="100%" sx={{ minWidth: 0 }}>
      <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="calendar-blank" size="sm" />
      </Box>
      <Typography variant="body2" noWrap>
        {children}
      </Typography>
    </Stack>
  )
}

function DurationCell({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} height="100%" sx={{ minWidth: 0 }}>
      <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="clock" size="sm" />
      </Box>
      <Typography variant="body2" noWrap>
        {children}
      </Typography>
    </Stack>
  )
}

/** Truncated text + copy control (shown on row hover). Copies `copyText` (e.g. full ID for short display). */
function CopyableIdCell({ displayText, copyText }: { displayText: string; copyText: string }) {
  const [copiedOpen, setCopiedOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleCopy = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(copyText)
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
        setCopiedOpen(true)
        closeTimerRef.current = setTimeout(() => {
          setCopiedOpen(false)
          closeTimerRef.current = null
        }, 2000)
      } catch {
        // ignore (permission / insecure context)
      }
    },
    [copyText],
  )

  return (
    <Stack
      direction="row"
      alignItems="center"
      height="100%"
      sx={{
        width: '100%',
        minWidth: 0,
        alignSelf: 'stretch',
        gap: 0.5,
        boxSizing: 'border-box',
      }}
    >
      <Typography component="span" variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
        {displayText}
      </Typography>
      <Tooltip
        title="Copied to Clipboard"
        open={copiedOpen}
        placement="top"
        disableHoverListener
        disableFocusListener
        disableTouchListener
      >
        <span>
          <IconButton
            className="copyable-id-btn"
            size="small"
            aria-label="Copy to clipboard"
            onClick={handleCopy}
            sx={{
              opacity: 0,
              flexShrink: 0,
              transition: 'opacity 120ms ease',
            }}
          >
            <Icon name="copy" size="sm" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  )
}

function CustomerCell({ row }: { row: ClosedInteractionRow }) {
  const name = row.customerName
  const raw = stringToColor(name)
  return (
    <Stack direction="row" alignItems="center" spacing={1} height="100%" sx={{ minWidth: 0 }}>
      <Avatar
        sx={(theme: Theme) => ({
          width: 24,
          height: 24,
          fontSize: theme.typography.pxToRem(12),
          fontWeight: theme.typography.fontWeightMedium,
          bgcolor: avatarFillFromHue(raw, theme),
          color: theme.palette.common.white,
        })}
      >
        {getInitials(name)}
      </Avatar>
      <Typography variant="body2" noWrap>
        {name}
      </Typography>
    </Stack>
  )
}

function QualityChip({ label, tone }: { label: string; tone: 'success' | 'warning' | 'error' }) {
  const theme = useTheme()
  return (
    <Chip label={label} size="small" variant="filled" color={tone} sx={tonalScoreSx(theme, tone)} />
  )
}

function ClosedInteractionListViewCell({
  row,
  onOpenMenu,
}: {
  row: ClosedInteractionRow
  onOpenMenu: (e: React.MouseEvent<HTMLElement>) => void
}) {
  const ch =
    row.channel === 'voice' ? 'Voice' : row.channel === 'email' ? 'Email' : 'WhatsApp'
  return (
    <Stack spacing={0.5} sx={{ py: 0.25, width: '100%', minWidth: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>
          {row.customerName}
        </Typography>
        <IconButton
          size="small"
          aria-label="More actions"
          variant="outlined"
          onClick={onOpenMenu}
          sx={{ flexShrink: 0 }}
        >
          <Icon name="dots-three-vertical" size="sm" />
        </IconButton>
      </Stack>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" useFlexGap sx={{ minWidth: 0, width: '100%' }}>
        <Box sx={{ flex: '1 1 120px', minWidth: 0, maxWidth: '100%' }}>
          <CopyableIdCell displayText={row.interactionIdShort} copyText={row.interactionIdFull} />
        </Box>
        <Typography variant="body2" color="text.secondary" component="span" sx={{ flexShrink: 0 }}>
          ·
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ lineHeight: 1.35 }}>
          {ch}
        </Typography>
        <Box sx={{ flex: '1 1 140px', minWidth: 0, maxWidth: '100%' }}>
          <CopyableIdCell displayText={row.channelId} copyText={row.channelId} />
        </Box>
        <QualityChip label={row.qualityLabel} tone={row.qualityTone} />
      </Stack>
    </Stack>
  )
}

export function ClosedInteractionPage() {
  const isListView = useMediaQuery(`(max-width:${CLOSED_INTERACTION_NARROW_MAX_WIDTH_PX}px)`)
  const [search, setSearch] = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [filterRecords, setFilterRecords] = useState<FilterRecords>(() => ({ ...INITIAL_TOOLBAR_FILTERS }))
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)

  const toolbarFilters = useMemo(() => buildToolbarFilterConfig(CLOSED_INTERACTION_ROWS), [])

  const filteredRows = useMemo(
    () => applyToolbarAndSearch(CLOSED_INTERACTION_ROWS, filterRecords, search),
    [filterRecords, search],
  )

  const handleBasicSearch = useCallback((value: string) => {
    setSearch(value)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, rowId: string) => {
    setMenuAnchorEl(event.currentTarget)
    setMenuRowId(rowId)
  }, [])

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null)
    setMenuRowId(null)
  }, [])

  const listViewColumn: GridListViewColDef<ClosedInteractionRow> = useMemo(
    () => ({
      field: 'listColumn',
      display: 'flex',
      align: 'left',
      renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
        <ClosedInteractionListViewCell
          row={params.row}
          onOpenMenu={(e) => {
            e.stopPropagation()
            handleMenuOpen(e, String(params.row.id))
          }}
        />
      ),
    }),
    [handleMenuOpen],
  )

  const columns: GridColDef<ClosedInteractionRow>[] = useMemo(
    () => [
      {
        field: 'customerName',
        headerName: 'Customer Name',
        flex: 1.1,
        minWidth: 208,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => <CustomerCell row={params.row} />,
      },
      {
        field: 'channelDetail',
        headerName: 'Channel Detail',
        flex: 0.9,
        minWidth: 140,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <Link href={`tel:${params.value}`} variant="body2">
            {String(params.value ?? '')}
          </Link>
        ),
      },
      {
        field: 'channel',
        headerName: 'Channel',
        flex: 0.85,
        minWidth: 154,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <ChannelCell channel={params.row.channel} />
        ),
      },
      {
        field: 'direction',
        headerName: 'Direction',
        flex: 0.85,
        minWidth: 154,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <DirectionCell direction={params.row.direction} />
        ),
      },
      {
        field: 'campaign',
        headerName: 'Campaign',
        flex: 0.8,
        minWidth: 130,
        sortable: true,
        resizable: true,
      },
      {
        field: 'queue',
        headerName: 'Queue',
        flex: 0.8,
        minWidth: 120,
        sortable: true,
        resizable: true,
      },
      {
        field: 'disposition',
        headerName: 'Disposition',
        flex: 0.8,
        minWidth: 130,
        sortable: true,
        resizable: true,
      },
      {
        field: 'startTime',
        headerName: 'Start Time',
        flex: 0.9,
        minWidth: 160,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <TimeWithIcon>{params.row.startTime}</TimeWithIcon>
        ),
      },
      {
        field: 'endTime',
        headerName: 'End Time',
        flex: 0.9,
        minWidth: 160,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <TimeWithIcon>{params.row.endTime}</TimeWithIcon>
        ),
      },
      {
        field: 'duration',
        headerName: 'Duration',
        flex: 0.85,
        minWidth: 140,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <DurationCell>{params.row.duration}</DurationCell>
        ),
      },
      {
        field: 'qualityLabel',
        headerName: 'Quality Profile Score',
        flex: 0.9,
        minWidth: 160,
        sortable: true,
        resizable: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <QualityChip label={params.row.qualityLabel} tone={params.row.qualityTone} />
        ),
      },
      {
        field: 'interactionIdShort',
        headerName: 'Interaction ID',
        flex: 1,
        minWidth: 158,
        sortable: true,
        resizable: true,
        cellClassName: 'ci-cell-copyable',
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <CopyableIdCell
            displayText={params.row.interactionIdShort}
            copyText={params.row.interactionIdFull}
          />
        ),
      },
      {
        field: 'channelId',
        headerName: 'Channel ID',
        flex: 1,
        minWidth: 174,
        sortable: true,
        resizable: true,
        cellClassName: 'ci-cell-copyable',
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <CopyableIdCell displayText={params.row.channelId} copyText={params.row.channelId} />
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 62,
        sortable: false,
        resizable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<ClosedInteractionRow>) => (
          <IconButton
            size="small"
            aria-label="More actions"
            variant="outlined"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              handleMenuOpen(e, String(params.row.id))
            }}
          >
            <Icon name="dots-three-vertical" size="sm" />
          </IconButton>
        ),
      },
    ],
    [handleMenuOpen],
  )

  const gridSx = useMemo(
    () => ({
      border: 'none',
      ...(isListView && {
        '& .MuiDataGrid-row': {
          minHeight: 'unset !important',
          maxHeight: 'none !important',
          height: 'auto !important',
        },
      }),
      '& .MuiDataGrid-columnSeparator': {
        opacity: 1,
        visibility: 'visible',
      },
      '& .MuiDataGrid-columnHeaders': {
        bgcolor: (t: Theme) => alpha(t.palette.grey[500], 0.08),
      },
      '& .MuiDataGrid-cell': {
        display: 'flex',
        alignItems: isListView ? 'flex-start' : 'center',
        minWidth: 0,
        overflow: 'hidden',
        ...(isListView && {
          padding: '12px',
          minHeight: 'unset',
          maxHeight: 'none',
        }),
      },
      ...(!isListView && {
        '& .MuiDataGrid-cell:not(.MuiDataGrid-cellCheckbox)': {
          py: 0,
        },
      }),
      /* Default: ellipsis on plain text cells. Copyable cells use flex + inner Typography noWrap. */
      '& .MuiDataGrid-cell:not(.ci-cell-copyable) .MuiDataGrid-cellContent': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '100%',
        minWidth: 0,
      },
      '& .ci-cell-copyable .MuiDataGrid-cellContent': {
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      },
      /* Row hover shows copy controls (table + list view cells). */
      '& .MuiDataGrid-row:hover .copyable-id-btn': {
        opacity: 1,
      },
    }),
    [isListView],
  )

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'surface.elevation1',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, minHeight: 480, width: '100%' }}>
        <DataGrid
          disableColumnResize={false}
          tableHeader={{
            title: 'RBAC',
            showSearch: true,
            searchType: 'basic',
            onBasicSearch: handleBasicSearch,
          }}
          rows={filteredRows}
          columns={columns}
          loading={false}
          checkboxSelection
          disableRowSelectionOnClick
          sortingMode="client"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pagination
          paginationMode="client"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10]}
          getRowId={(r: ClosedInteractionRow) => r.id}
          customToolbarFilters={toolbarFilters}
          onToolbarFiltersChange={(filters: FilterRecords) => {
            setFilterRecords(filters)
            setPaginationModel((p) => ({ ...p, page: 0 }))
          }}
          showAppliedFilters
          maxVisibleAppliedFilters={4}
          onRefresh={() => {}}
          listView={isListView}
          listViewColumn={listViewColumn}
          getRowHeight={isListView ? () => 'auto' : undefined}
          initialState={{ pinnedColumns: { right: ['actions'] } }}
          sx={gridSx}
        />
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        <MenuItem
          onClick={() => {
            console.log('Edit', menuRowId)
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            <Icon name="pencil-simple-line" size="sm" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log('Download', menuRowId)
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            <Icon name="download-simple" size="sm" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            console.log('Delete', menuRowId)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Icon name="trash-simple" size="sm" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  )
}
