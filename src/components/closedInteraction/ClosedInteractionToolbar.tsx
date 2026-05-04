import type { GridRowId, GridToolbarProps } from '@mui/x-data-grid-pro'
import { memo } from 'react'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  AppliedFilters,
  type AppliedFilter,
  Button,
  ColumnsPanelTrigger,
  Icon,
  IconButton,
  Tooltip,
  Toolbar,
  gridRowSelectionIdsSelector,
  useGridApiContext,
  useGridSelector,
} from '@exotel-npm-dev/signal-design-system'
import type { BulkDeleteConfig, ToolbarButtonConfig, ToolbarFilterConfig } from '@exotel-npm-dev/signal-design-system'
import { ToolbarSortItem } from './ToolbarSortItem'
import type { FilterRecords, FilterValue } from '../../types/filterRecords'
import { ResponsiveToolbarFilterField } from './ResponsiveToolbarFilterField'

function RefreshButton({ onClick, loading }: { onClick?: () => void; loading?: boolean }) {
  return (
    <IconButton
      onClick={onClick}
      size="small"
      aria-label="Refresh"
      disabled={loading}
      sx={{
        '@keyframes closedInteractionRefreshSpin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        ...(loading && {
          animation: 'closedInteractionRefreshSpin 0.8s linear infinite',
        }),
      }}
    >
      <Icon name="arrows-clockwise" size="sm" />
    </IconButton>
  )
}

export interface ClosedInteractionToolbarProps extends Partial<GridToolbarProps> {
  customButtons?: ToolbarButtonConfig[]
  customFilters?: ToolbarFilterConfig[]
  appliedFilters?: AppliedFilter[]
  showAppliedFilters?: boolean
  maxVisibleAppliedFilters?: number
  bulkDeleteConfig?: BulkDeleteConfig
  filterValues?: FilterRecords
  hideSort?: boolean
  onFilterValuesChange?: (id: string, value: FilterValue) => void
  onClearAllFilters?: () => void
  onRefresh?: () => void
  loading?: boolean
}

/** Same behavior as Signal `CustomToolbar`, with wrapping filter row + responsive filter fields. */
export const ClosedInteractionToolbar = memo(function ClosedInteractionToolbar({
  customButtons,
  customFilters,
  appliedFilters,
  showAppliedFilters = true,
  maxVisibleAppliedFilters = 4,
  bulkDeleteConfig,
  filterValues = {},
  hideSort = false,
  onFilterValuesChange,
  onClearAllFilters,
  onRefresh,
  loading,
}: ClosedInteractionToolbarProps) {
  const apiRef = useGridApiContext()
  const rowSelectionIds = useGridSelector(apiRef, gridRowSelectionIdsSelector)
  const theme = useTheme()

  const selectedIds = Array.from(rowSelectionIds.keys())
  const selectedCount = selectedIds.length
  const showBulkDelete = Boolean(bulkDeleteConfig) && selectedCount > 0

  const handleChangeFilter = (value: FilterValue, filter: ToolbarFilterConfig) => {
    onFilterValuesChange?.(filter.id, value)
    filter?.onChange?.(value)
  }

  const handleFilterRemove = (filterId: string) => {
    const initialValue = customFilters?.find((f) => f.id === filterId)?.initialValue
    onFilterValuesChange?.(filterId, initialValue)
  }

  return (
    <>
      <Toolbar>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
          py={1.5}
          flexWrap="wrap"
          rowGap={1}
          columnGap={1}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            flexWrap="wrap"
            rowGap={1}
            columnGap={1}
            sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' }, minWidth: 0 }}
          >
            {showBulkDelete ? (
              <>
                <Button
                  color="error"
                  variant="text"
                  size="small"
                  startIconProps={{ name: 'trash' }}
                  disabled={bulkDeleteConfig?.disabled}
                  onClick={() => bulkDeleteConfig?.onDelete(selectedIds)}
                >
                  {typeof bulkDeleteConfig?.label === 'function'
                    ? bulkDeleteConfig.label(selectedCount)
                    : bulkDeleteConfig?.label || `Delete ${selectedCount} Rows`}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  startIconProps={{
                    name: 'x',
                    weight: 'bold',
                    color: theme.vars?.palette.primary.main,
                    size: 'sm',
                  }}
                  onClick={() =>
                    apiRef.current?.setRowSelectionModel({ type: 'include', ids: new Set<GridRowId>() })
                  }
                >
                  Discard
                </Button>
              </>
            ) : (
              <>
                {customFilters?.map((filter) => (
                  <ResponsiveToolbarFilterField
                    key={filter.id}
                    filter={filter}
                    filterValues={filterValues}
                    onFilterChange={handleChangeFilter}
                  />
                ))}
              </>
            )}
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={0.25}
            flexShrink={0}
            sx={{ ml: { xs: 'auto', md: 0 } }}
          >
            {customButtons?.map((button) => {
              const ButtonComponent = (
                <IconButton
                  key={button.id}
                  onClick={button.onClick}
                  disabled={button.disabled}
                  color={button.color || 'default'}
                  size="small"
                  aria-label={button.label}
                >
                  {button.icon}
                </IconButton>
              )

              return button.tooltip ? (
                <Tooltip key={button.id} title={button.tooltip}>
                  {ButtonComponent}
                </Tooltip>
              ) : (
                ButtonComponent
              )
            })}

            <ColumnsPanelTrigger
              render={
                <IconButton size="small">
                  <Icon name="layout" size="sm" />
                </IconButton>
              }
            />
            {!hideSort && <ToolbarSortItem />}
            <RefreshButton onClick={onRefresh} loading={loading} />
          </Box>
        </Box>
        {appliedFilters && appliedFilters.length > 0 && showAppliedFilters && (
          <AppliedFilters
            filters={appliedFilters}
            onRemove={handleFilterRemove}
            onClearAll={onClearAllFilters ?? (() => {})}
            maxVisible={maxVisibleAppliedFilters}
            show={showAppliedFilters}
          />
        )}
      </Toolbar>
    </>
  )
})

ClosedInteractionToolbar.displayName = 'ClosedInteractionToolbar'
