import {
  Fragment,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Popper from '@mui/material/Popper'
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'
import Snackbar from '@mui/material/Snackbar'
import { Link as RouterLink } from 'react-router-dom'
import type { GridRenderCellParams } from '@mui/x-data-grid-pro'
import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import {
  Box,
  Button,
  Breadcrumbs,
  Chip,
  DataGrid,
  Divider,
  Drawer,
  EnhancedTextField,
  Icon,
  IconButton,
  Link,
  Menu,
  Paper,
  Stack,
  Tooltip,
  Typography,
  type GridColDef,
  type ToolbarFilterConfig,
} from '@exotel-npm-dev/signal-design-system'
import type { FilterRecords } from '../../types/filterRecords'

import { RBAC_IMPACT_BASE } from './constants'
import { DirtyPulseLabel, DiscardChangesDialog } from './shared'

const DRAWER_WIDTH = 560

/** Same surface as ManageUsersDrawer (Assign Users) — Signal drawer header */
const DRAWER_HEADER_BG = '#f1f1f1'

function FieldReadOnlyHint({ readOnly, children }: { readOnly: boolean; children: ReactNode }) {
  if (!readOnly) return children
  return (
    <Tooltip title="Read-only — select Edit to update this contact" placement="top" enterDelay={280}>
      <Box component="span" sx={{ display: 'block', width: '100%' }}>
        {children}
      </Box>
    </Tooltip>
  )
}

const dataGridSx = {
  '& .MuiDataGrid-root': {
    bgcolor: 'background.paper',
  },
  '& .MuiDataGrid-main': {
    bgcolor: 'background.paper',
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  '& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader': {
    alignItems: 'center',
  },
  '& .MuiDataGrid-columnHeaderTitleContainer': {
    alignItems: 'center',
  },
} as const

type ContactType = 'registered' | 'unregistered'

type AccountType = 'savings' | 'current' | 'fixed_deposit' | 'credit'

type ContactRow = {
  id: string
  contactName: string
  contactType: ContactType
  phone1: string
  phone2: string
  email: string
  timezone: string
  twitter: string
  facebook: string
  accountType: AccountType
}

const ACCOUNT_LABEL: Record<AccountType, string> = {
  savings: 'Savings',
  current: 'Current',
  fixed_deposit: 'Fixed deposit',
  credit: 'Credit',
}

const CONTACT_ROWS: ContactRow[] = [
  {
    id: 'c-1',
    contactName: 'Aditya Pratap Singh',
    contactType: 'registered',
    phone1: '+91 98765 43210',
    phone2: '—',
    email: 'aditya.singh@example.com',
    timezone: 'Asia/Kolkata',
    twitter: '@aditya_ops',
    facebook: 'aditya.singh',
    accountType: 'savings',
  },
  {
    id: 'c-2',
    contactName: 'Rashika Jain',
    contactType: 'registered',
    phone1: '+91 99887 76655',
    phone2: '+91 91234 56789',
    email: 'rashika.jain@example.com',
    timezone: 'Asia/Kolkata',
    twitter: '—',
    facebook: 'rashika.jain',
    accountType: 'current',
  },
  {
    id: 'c-3',
    contactName: 'Walk-in lead #4482',
    contactType: 'unregistered',
    phone1: '+91 90000 11223',
    phone2: '—',
    email: '—',
    timezone: 'Asia/Dubai',
    twitter: '—',
    facebook: '—',
    accountType: 'savings',
  },
  {
    id: 'c-4',
    contactName: 'HDFC Branch Desk',
    contactType: 'registered',
    phone1: '+91 80444 55666',
    phone2: '+91 80444 55667',
    email: 'desk.hdfc@example.com',
    timezone: 'Asia/Kolkata',
    twitter: '—',
    facebook: 'hdfc.desk',
    accountType: 'fixed_deposit',
  },
  {
    id: 'c-5',
    contactName: 'Vendor — CloudTel',
    contactType: 'unregistered',
    phone1: '+1 415 555 0199',
    phone2: '—',
    email: 'ops@cloudtel.example',
    timezone: 'America/Los_Angeles',
    twitter: '@cloudtel',
    facebook: '—',
    accountType: 'credit',
  },
  {
    id: 'c-6',
    contactName: 'Anjali Srivastava',
    contactType: 'registered',
    phone1: '+91 98100 22334',
    phone2: '+91 98100 22335',
    email: 'anjali.s@example.com',
    timezone: 'Europe/London',
    twitter: '@anjali_s',
    facebook: 'anjali.srivastava',
    accountType: 'current',
  },
]

const INITIAL_FILTERS: FilterRecords = {
  contact_type: 'all',
  contact_timezone: 'all',
}

function buildContactFilters(rows: ContactRow[]): ToolbarFilterConfig[] {
  const timezones = [...new Set(rows.map((r) => r.timezone))].sort()
  return [
    {
      id: 'contact_type',
      type: 'select',
      label: 'Contact type',
      iconName: 'user',
      options: [
        { value: 'all', label: 'All' },
        { value: 'registered', label: 'Registered' },
        { value: 'unregistered', label: 'Unregistered' },
      ],
      initialValue: 'all',
    },
    {
      id: 'contact_timezone',
      type: 'select',
      label: 'Timezone',
      iconName: 'calendar-blank',
      options: [{ value: 'all', label: 'All' }, ...timezones.map((tz) => ({ value: tz, label: tz }))],
      initialValue: 'all',
    },
  ]
}

function applyContactFilters(rows: ContactRow[], search: string, filters: FilterRecords): ContactRow[] {
  let next = rows

  const q = search.trim().toLowerCase()
  if (q) {
    next = next.filter((r) => {
      const hay = [
        r.contactName,
        r.phone1,
        r.phone2,
        r.email,
        r.timezone,
        r.twitter,
        r.facebook,
        ACCOUNT_LABEL[r.accountType],
        r.contactType,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

  const ct = filters.contact_type
  if (ct && ct !== 'all') {
    next = next.filter((r) => r.contactType === ct)
  }

  const tz = filters.contact_timezone
  if (tz && tz !== 'all') {
    next = next.filter((r) => r.timezone === tz)
  }

  return next
}

function snackSlide(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

function ContactTypeChip({ contactType }: { contactType: ContactType }) {
  if (contactType === 'registered') {
    return <Chip size="small" label="Registered" variant="tonal" color="success" />
  }
  return <Chip size="small" label="Unregistered" variant="tonal" color="default" />
}

export function PatternDrawerRoleDemoPage() {
  const [rows, setRows] = useState<ContactRow[]>(() => [...CONTACT_ROWS])
  const [search, setSearch] = useState('')
  const [filterRecords, setFilterRecords] = useState<FilterRecords>(() => ({ ...INITIAL_FILTERS }))
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)

  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const splitCreateAnchorRef = useRef<HTMLDivElement | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [editFields, setEditFields] = useState<Partial<ContactRow>>({})

  const snapshotRef = useRef<Partial<ContactRow> | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [discardIntent, setDiscardIntent] = useState<'footer-cancel' | 'close-drawer' | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const toolbarFilters = useMemo(() => buildContactFilters(rows), [rows])
  const filteredRows = useMemo(
    () => applyContactFilters(rows, search, filterRecords),
    [rows, search, filterRecords],
  )

  const hydrateFromRow = useCallback((r: ContactRow) => {
    setActiveId(r.id)
    setEditFields({ ...r })
  }, [])

  const openDrawerView = useCallback(
    (r: ContactRow) => {
      hydrateFromRow(r)
      setMode('view')
      snapshotRef.current = null
      setDrawerOpen(true)
    },
    [hydrateFromRow],
  )

  const enterEdit = () => {
    snapshotRef.current = { ...editFields }
    setMode('edit')
  }

  const rowSignature = (p: Partial<ContactRow>) =>
    [
      p.contactName ?? '',
      p.phone1 ?? '',
      p.phone2 ?? '',
      p.email ?? '',
      p.timezone ?? '',
      p.twitter ?? '',
      p.facebook ?? '',
      p.accountType ?? '',
      p.contactType ?? '',
    ].join('\u0000')

  const editDirtyCount = useMemo(() => {
    if (mode !== 'edit' || !snapshotRef.current) return 0
    return rowSignature(snapshotRef.current) === rowSignature(editFields) ? 0 : 1
  }, [mode, editFields])

  const requestCloseDrawer = () => {
    if (mode === 'edit' && editDirtyCount > 0) {
      setDiscardIntent('close-drawer')
      setDiscardOpen(true)
      return
    }
    setDrawerOpen(false)
    setMode('view')
  }

  const handleKeepEditing = () => {
    setDiscardOpen(false)
    setDiscardIntent(null)
  }

  const handleDiscard = () => {
    if (!snapshotRef.current) {
      setDiscardOpen(false)
      setDiscardIntent(null)
      return
    }
    setEditFields({ ...snapshotRef.current })
    snapshotRef.current = null
    setDiscardOpen(false)
    if (discardIntent === 'close-drawer') {
      setDrawerOpen(false)
      setMode('view')
    } else {
      setMode('view')
    }
    setDiscardIntent(null)
  }

  const handleCancelFooter = () => {
    if (editDirtyCount > 0) {
      setDiscardIntent('footer-cancel')
      setDiscardOpen(true)
      return
    }
    setMode('view')
    snapshotRef.current = null
  }

  const saveChanges = () => {
    if (!activeId || !editFields.contactName?.trim()) return
    const next: ContactRow = {
      id: activeId,
      contactName: editFields.contactName.trim(),
      contactType: editFields.contactType ?? 'unregistered',
      phone1: editFields.phone1 ?? '—',
      phone2: editFields.phone2 ?? '—',
      email: editFields.email ?? '—',
      timezone: editFields.timezone ?? 'Asia/Kolkata',
      twitter: editFields.twitter ?? '—',
      facebook: editFields.facebook ?? '—',
      accountType: (editFields.accountType as AccountType) ?? 'savings',
    }
    setRows((prev) => prev.map((x) => (x.id === activeId ? next : x)))
    setMode('view')
    snapshotRef.current = null
    setToastMsg('Changes saved')
    setToastOpen(true)
  }

  const handleToolbarFiltersChange = useCallback((filters: FilterRecords) => {
    setFilterRecords(filters)
    setPaginationModel((p) => ({ ...p, page: 0 }))
  }, [])

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, rowId: string) => {
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
    setMenuRowId(rowId)
  }, [])

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null)
    setMenuRowId(null)
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastOpen(true)
  }

  const handleMenuAction = useCallback(
    (action: 'duplicate' | 'delete') => {
      const id = menuRowId
      handleMenuClose()
      if (!id) return
      if (action === 'duplicate') showToast('Duplicate contact (demo)')
      else showToast('Delete contact (demo)')
    },
    [menuRowId, handleMenuClose],
  )

  const handleRowClick = useCallback(
    (params: { row: ContactRow }) => {
      openDrawerView(params.row)
    },
    [openDrawerView],
  )

  const columns: GridColDef<ContactRow>[] = useMemo(
    () => [
      {
        field: 'contactName',
        headerName: 'Contact name',
        flex: 1,
        minWidth: 170,
        renderCell: (params: GridRenderCellParams<ContactRow>) => (
          <Box sx={{ minWidth: 0, width: '100%', overflow: 'hidden' }}>
            <Typography
              variant="body2"
              component="span"
              noWrap
              sx={{
                display: 'block',
                fontFamily: (theme: Theme) => theme.typography.fontFamily,
                color: 'primary.main',
                fontWeight: (theme: Theme) => theme.typography.fontWeightMedium,
                cursor: 'pointer',
                lineHeight: 1.43,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'contactType',
        headerName: 'Contact type',
        width: 150,
        renderCell: (params: GridRenderCellParams<ContactRow, ContactRow['contactType']>) => (
          <ContactTypeChip contactType={params.value!} />
        ),
      },
      {
        field: 'phone1',
        headerName: 'Phone 1',
        width: 150,
        renderCell: (params) => (
          <Typography variant="body2" noWrap sx={{ minWidth: 0, width: '100%' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'phone2',
        headerName: 'Phone 2',
        width: 140,
        renderCell: (params) => (
          <Typography variant="body2" noWrap sx={{ minWidth: 0, width: '100%', color: 'text.secondary' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Typography variant="body2" noWrap sx={{ minWidth: 0, width: '100%' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'timezone',
        headerName: 'Timezone',
        width: 160,
        renderCell: (params) => (
          <Typography variant="body2" noWrap sx={{ minWidth: 0, width: '100%' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'twitter',
        headerName: 'Twitter',
        width: 130,
        renderCell: (params) => (
          <Typography variant="body2" noWrap sx={{ minWidth: 0, width: '100%', color: 'text.secondary' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'facebook',
        headerName: 'Facebook',
        width: 130,
        renderCell: (params) => (
          <Typography variant="body2" noWrap sx={{ minWidth: 0, width: '100%', color: 'text.secondary' }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'accountType',
        headerName: 'Account type',
        width: 140,
        renderCell: (params: GridRenderCellParams<ContactRow, ContactRow['accountType']>) => (
          <Chip size="small" label={ACCOUNT_LABEL[params.value!]} variant="tonal" color="default" />
        ),
      },
      {
        field: 'actions',
        headerName: ' ',
        width: 56,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<ContactRow>) => (
          <IconButton
            size="small"
            aria-label="Row actions"
            variant="outlined"
            onClick={(e: React.MouseEvent<HTMLElement>) => handleMenuOpen(e, params.row.id)}
          >
            <Icon name="dots-three-vertical" size="sm" />
          </IconButton>
        ),
      },
    ],
    [handleMenuOpen],
  )

  const readOnly = mode === 'view'
  const displayName = editFields.contactName ?? ''

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Breadcrumbs separator="/" sx={{ mb: 1, flexShrink: 0 }}>
        <Typography variant="body2" color="text.secondary" component="span">
          User Management
        </Typography>
        <Link component={RouterLink} to={RBAC_IMPACT_BASE} underline="hover" variant="body2" sx={{ color: 'text.secondary' }}>
          RBAC UI Impact
        </Link>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          Contacts
        </Typography>
      </Breadcrumbs>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            bgcolor: 'surface.elevation1',
            p: (theme: Theme) => theme.spacing(1.5, 2),
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            rowGap: 2,
          }}
        >
          <Box sx={{ minWidth: 0, flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="title3">Contacts</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage contact profiles, channels, and account types.
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="flex-end" gap={1.5} sx={{ flexShrink: 0 }}>
            <EnhancedTextField
              id="contacts-search"
              placeholder="Search"
              size="medium"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value)
                setPaginationModel((p) => ({ ...p, page: 0 }))
              }}
              sx={{ minWidth: { xs: 200, sm: 280 }, flex: '1 1 auto', maxWidth: { sm: 400 } }}
              slotProps={{
                input: {
                  startAdornment: <Icon name="magnifying-glass" size="sm" />,
                },
              }}
            />
            <Box
              ref={splitCreateAnchorRef}
              sx={(theme: Theme) => {
                /** Match Signal split primary (~8px corner, flat join, single elevation) — avoid MUI ButtonGroup + theme fights */
                const r = theme.spacing(1)
                const splitLine = alpha(theme.palette.primary.contrastText, 0.28)
                return {
                  display: 'inline-flex',
                  alignItems: 'stretch',
                  flexShrink: 0,
                  borderRadius: r,
                  overflow: 'hidden',
                  '& .MuiButton-root': {
                    margin: 0,
                    borderRadius: 0,
                  },
                  '& .split-main': {
                    textTransform: 'none',
                    fontWeight: theme.typography.fontWeightMedium,
                    fontSize: theme.typography.pxToRem(14),
                    lineHeight: '24px',
                    letterSpacing: '0.026em',
                    px: theme.spacing(2),
                    py: `${10}px`,
                    minHeight: 40,
                    borderRight: `1px solid ${splitLine}`,
                  },
                  '& .split-menu': {
                    minWidth: 44,
                    px: `${10}px`,
                    py: `${10}px`,
                    minHeight: 40,
                  },
                }
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="medium"
                disableElevation
                className="split-main"
                sx={{
                  borderTopLeftRadius: (t: Theme) => `${t.spacing(1)}`,
                  borderBottomLeftRadius: (t: Theme) => `${t.spacing(1)}`,
                }}
                onClick={() => showToast('Create contact')}
              >
                Create contact
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="medium"
                disableElevation
                className="split-menu"
                aria-label="Create contact options"
                sx={{
                  borderTopRightRadius: (t: Theme) => `${t.spacing(1)}`,
                  borderBottomRightRadius: (t: Theme) => `${t.spacing(1)}`,
                }}
                onClick={() => setCreateMenuOpen((o) => !o)}
              >
                <Icon name="caret-down" size="sm" sx={{ display: 'block', color: 'inherit' }} />
              </Button>
            </Box>
            <Popper
              open={createMenuOpen}
              anchorEl={splitCreateAnchorRef.current}
              placement="bottom-end"
              sx={{ zIndex: (t: Theme) => t.zIndex.modal }}
            >
              <ClickAwayListener onClickAway={() => setCreateMenuOpen(false)}>
                <Paper elevation={8} sx={{ mt: 0.5, minWidth: 220 }}>
                  <MenuList dense autoFocusItem={createMenuOpen}>
                    <MenuItem
                      onClick={() => {
                        setCreateMenuOpen(false)
                        showToast('Create manually')
                      }}
                    >
                      Create manually
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setCreateMenuOpen(false)
                        showToast('Bulk upload (CSV)')
                      }}
                    >
                      Bulk upload (CSV)
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setCreateMenuOpen(false)
                        showToast('Bulk delete (CSV)')
                      }}
                    >
                      Bulk delete (CSV)
                    </MenuItem>
                  </MenuList>
                </Paper>
              </ClickAwayListener>
            </Popper>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            '& > div': {
              width: '100%',
              minWidth: 0,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <DataGrid<ContactRow>
            listView={false}
            sortingMode="client"
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            rows={filteredRows}
            columns={columns}
            pagination
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25]}
            density="standard"
            customToolbarFilters={toolbarFilters}
            onToolbarFiltersChange={handleToolbarFiltersChange}
            showAppliedFilters
            maxVisibleAppliedFilters={4}
            initialState={{
              pinnedColumns: { right: ['actions'] },
              sorting: {
                sortModel: [{ field: 'contactName', sort: 'asc' }],
              },
            }}
            onRefresh={() => setPaginationModel((p) => ({ ...p, page: 0 }))}
            sx={{
              ...dataGridSx,
              minWidth: { xs: 200, sm: 280 },
              width: '100%',
              maxWidth: '100%',
              flex: 1,
              minHeight: 0,
              border: 'none',
              '& .MuiDataGrid-root': {
                bgcolor: 'background.paper',
                width: '100%',
              },
              '& .MuiDataGrid-main': {
                bgcolor: 'background.paper',
              },
            }}
          />
        </Box>
      </Paper>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => requestCloseDrawer()}
        slotProps={{
          backdrop: {
            sx: (theme: Theme) => ({
              backdropFilter: 'blur(1.50px)',
              WebkitBackdropFilter: 'blur(1.50px)',
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(15, 23, 42, 0.18)' : 'rgba(0, 0, 0, 0.48)',
            }),
          },
          paper: {
            sx: {
              width: { xs: '100%', sm: `${DRAWER_WIDTH}px` },
              maxWidth: '100vw',
              boxSizing: 'border-box',
              boxShadow:
                '0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.12)',
            },
          },
        }}
        footerActions={
          mode === 'edit' ? (
            <Fragment>
              <DirtyPulseLabel count={editDirtyCount} />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" color="neutral" size="medium" onClick={handleCancelFooter}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  disabled={editDirtyCount === 0}
                  onClick={saveChanges}
                >
                  Save changes
                </Button>
              </Stack>
            </Fragment>
          ) : undefined
        }
        headerContent={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1,
              px: 2,
              py: `${13}px`,
              bgcolor: DRAWER_HEADER_BG,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body3"
                color="text.secondary"
                component="p"
                sx={{
                  letterSpacing: 0.28,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Contact
              </Typography>
              <Typography variant="title3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                {displayName || '—'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              {readOnly ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="medium"
                  startIconProps={{ name: 'pencil-simple-line', size: 'sm' }}
                  onClick={enterEdit}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    /** Keep icon + label on one optical center line */
                    lineHeight: 1,
                    '& .MuiButton-startIcon': {
                      marginTop: 0,
                      marginBottom: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                    },
                  }}
                >
                  Edit
                </Button>
              ) : null}
              <IconButton size="small" variant="outlined" aria-label="Close" onClick={() => requestCloseDrawer()}>
                <Icon name="x" size="sm" />
              </IconButton>
            </Stack>
          </Box>
        }
      >
        <Stack divider={<Divider />} spacing={0} sx={{ py: 1 }}>
          <Stack spacing={1.5} sx={{ px: 2, pt: 1, pb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              General
            </Typography>
            <FieldReadOnlyHint readOnly={readOnly}>
              <EnhancedTextField
                label="Contact name"
                fullWidth
                size="medium"
                disabled={readOnly}
                value={editFields.contactName ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFields((p) => ({ ...p, contactName: e.target.value }))}
              />
            </FieldReadOnlyHint>
            <FieldReadOnlyHint readOnly={readOnly}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 92 }}>
                  Contact type
                </Typography>
                <Chip
                  size="small"
                  label={editFields.contactType === 'registered' ? 'Registered' : 'Unregistered'}
                  variant="tonal"
                  color={editFields.contactType === 'registered' ? 'success' : 'default'}
                  disabled={readOnly}
                  onClick={
                    readOnly
                      ? undefined
                      : () =>
                          setEditFields((p) => ({
                            ...p,
                            contactType: p.contactType === 'registered' ? 'unregistered' : 'registered',
                          }))
                  }
                  sx={readOnly ? undefined : { cursor: 'pointer' }}
                />
              </Stack>
            </FieldReadOnlyHint>
            <FieldReadOnlyHint readOnly={readOnly}>
              <EnhancedTextField
                label="Phone 1"
                fullWidth
                size="medium"
                disabled={readOnly}
                value={editFields.phone1 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFields((p) => ({ ...p, phone1: e.target.value }))}
              />
            </FieldReadOnlyHint>
            <FieldReadOnlyHint readOnly={readOnly}>
              <EnhancedTextField
                label="Phone 2"
                fullWidth
                size="medium"
                disabled={readOnly}
                value={editFields.phone2 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFields((p) => ({ ...p, phone2: e.target.value }))}
              />
            </FieldReadOnlyHint>
            <FieldReadOnlyHint readOnly={readOnly}>
              <EnhancedTextField
                label="Email"
                fullWidth
                size="medium"
                disabled={readOnly}
                value={editFields.email ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFields((p) => ({ ...p, email: e.target.value }))}
              />
            </FieldReadOnlyHint>
            <FieldReadOnlyHint readOnly={readOnly}>
              <EnhancedTextField
                label="Timezone"
                fullWidth
                size="medium"
                disabled={readOnly}
                value={editFields.timezone ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFields((p) => ({ ...p, timezone: e.target.value }))}
              />
            </FieldReadOnlyHint>
          </Stack>

          <Stack spacing={1.5} sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Social &amp; account
            </Typography>
            <FieldReadOnlyHint readOnly={readOnly}>
              <EnhancedTextField
                label="Twitter"
                fullWidth
                size="medium"
                disabled={readOnly}
                value={editFields.twitter ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFields((p) => ({ ...p, twitter: e.target.value }))}
              />
            </FieldReadOnlyHint>
            <FieldReadOnlyHint readOnly={readOnly}>
              <EnhancedTextField
                label="Facebook"
                fullWidth
                size="medium"
                disabled={readOnly}
                value={editFields.facebook ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditFields((p) => ({ ...p, facebook: e.target.value }))}
              />
            </FieldReadOnlyHint>
            <FieldReadOnlyHint readOnly={readOnly}>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 92 }}>
                  Account type
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
                  {(Object.keys(ACCOUNT_LABEL) as AccountType[]).map((key) => (
                    <Chip
                      key={key}
                      size="small"
                      label={ACCOUNT_LABEL[key]}
                      variant="tonal"
                      color={editFields.accountType === key ? 'primary' : 'default'}
                      disabled={readOnly}
                      onClick={readOnly ? undefined : () => setEditFields((p) => ({ ...p, accountType: key }))}
                      sx={readOnly ? undefined : { cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Stack>
            </FieldReadOnlyHint>
          </Stack>
        </Stack>
      </Drawer>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem onClick={() => handleMenuAction('duplicate')}>
          Duplicate contact
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <DiscardChangesDialog open={discardOpen} onKeepEditing={handleKeepEditing} onDiscard={handleDiscard} />

      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        TransitionComponent={snackSlide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={
          toastMsg ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon name="check-circle" size="sm" sx={{ color: 'success.main' }} />
              <Typography variant="body2" component="span">
                {toastMsg}
              </Typography>
            </Stack>
          ) : null
        }
      />
    </Box>
  )
}
