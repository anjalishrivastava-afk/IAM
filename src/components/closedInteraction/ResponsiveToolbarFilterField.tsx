import { useState, type ChangeEvent } from 'react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import Drawer from '@mui/material/Drawer'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import {
  Button,
  DateRangePicker,
  EnhancedTextField,
  Icon,
  MultiSelect,
} from '@exotel-npm-dev/signal-design-system'
import type { DateRangeValue, ToolbarFilterConfig } from '@exotel-npm-dev/signal-design-system'
import type { FilterRecords, FilterValue } from '../../types/filterRecords'
import { CLOSED_INTERACTION_NARROW_MAX_WIDTH_PX } from './closedInteractionConstants'
import { LabelOnlyDateRangeTextField } from './LabelOnlyDateRangeTextField'

export interface ResponsiveToolbarFilterFieldProps {
  filter: ToolbarFilterConfig
  filterValues: FilterRecords
  onFilterChange: (value: FilterValue, filter: ToolbarFilterConfig) => void
}

const emptyRange: DateRangeValue = { startDate: null, endDate: null }

function ResponsiveDateRangeToolbarFilter({
  filter,
  value,
  onFilterChange,
}: {
  filter: ToolbarFilterConfig
  value: FilterValue
  onFilterChange: (value: FilterValue, filter: ToolbarFilterConfig) => void
}) {
  const dateRangeValue = (value as DateRangeValue | undefined) ?? emptyRange
  const [tempValue, setTempValue] = useState<DateRangeValue>(dateRangeValue)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DateRangePicker
      shortcuts={filter.shortcuts}
      enableAccessibleFieldDOMStructure={false}
      open={isOpen}
      onOpen={() => {
        setIsOpen(true)
        setTempValue(dateRangeValue)
      }}
      onClose={() => setIsOpen(false)}
      value={[tempValue.startDate, tempValue.endDate]}
      onChange={(newValue: unknown) => {
        if (newValue && Array.isArray(newValue)) {
          setTempValue({
            startDate: newValue[0] as Dayjs,
            endDate: newValue[1] as Dayjs,
          })
        }
      }}
      onAccept={(newValue: unknown) => {
        if (newValue && Array.isArray(newValue)) {
          const [startDate, endDate] = newValue
          if (startDate && endDate) {
            onFilterChange(
              { startDate: startDate as Dayjs, endDate: endDate as Dayjs },
              filter,
            )
          }
        }
        setIsOpen(false)
      }}
      disabled={filter.disabled}
      closeOnSelect={false}
      minDate={filter.allowPastDates === false ? dayjs().startOf('day') : undefined}
      maxDate={filter.allowFutureDates === false ? dayjs().endOf('day') : undefined}
      desktopModeMediaQuery={`@media (min-width: ${CLOSED_INTERACTION_NARROW_MAX_WIDTH_PX + 1}px)`}
      slots={{
        textField: LabelOnlyDateRangeTextField,
        clearButton: () => null,
      }}
      slotProps={{
        field: {
          clearable: true,
          onClear: () => {
            onFilterChange(emptyRange, filter)
          },
        },
        textField: {
          filterLabel: filter.label,
          size: 'small',
          sx: {
            minWidth: filter.width,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--mui-palette-Chip-defaultBorder)',
            },
          },
          InputProps: {
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
                <Icon name="calendar-blank" size="sm" />
              </InputAdornment>
            ),
          },
          onClick: (event: React.MouseEvent) => {
            event.stopPropagation()
            if (!isOpen) setIsOpen(true)
          },
        } as Record<string, unknown>,
        shortcuts: {
          changeImportance: 'accept',
        },
        actionBar: {
          actions: ['cancel', 'accept'],
        },
      }}
    />
  )
}

function SelectFilterSheet({
  filter,
  value,
  onFilterChange,
}: {
  filter: ToolbarFilterConfig
  value: string
  onFilterChange: (value: FilterValue, filter: ToolbarFilterConfig) => void
}) {
  const [open, setOpen] = useState(false)
  const theme = useTheme()

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        disabled={filter.disabled}
        onClick={() => setOpen(true)}
        {...(filter.iconName
          ? { startIconProps: { name: filter.iconName, size: 'sm' as const } }
          : {})}
        sx={{
          minWidth: filter.width ?? 140,
          borderColor: 'var(--mui-palette-Chip-defaultBorder)',
          fontWeight: theme.typography.fontWeightRegular,
        }}
      >
        {filter.label}
      </Button>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: `${Number(theme.shape.borderRadius) * 2}px ${Number(theme.shape.borderRadius) * 2}px 0 0`,
              maxHeight: 'min(72vh, 520px)',
            },
          },
        }}
      >
        <List sx={{ py: 0 }} disablePadding>
          {filter.options?.map((option) => (
            <ListItemButton
              key={option.value}
              selected={option.value === value}
              onClick={() => {
                onFilterChange(option.value, filter)
                setOpen(false)
              }}
            >
              <ListItemText primary={option.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  )
}

/**
 * Signal `ToolbarFilterField` behavior + narrow screens: select options open in a bottom sheet;
 * date range uses Phosphor calendar adornment and mobile-friendly picker layout.
 */
export function ResponsiveToolbarFilterField({
  filter,
  filterValues,
  onFilterChange,
}: ResponsiveToolbarFilterFieldProps) {
  const useBottomSheet = useMediaQuery(
    `(max-width:${CLOSED_INTERACTION_NARROW_MAX_WIDTH_PX}px)`,
  )

  const commonProps = {
    disabled: filter.disabled,
    size: 'small' as const,
    sx: { minWidth: filter.width },
  }

  switch (filter.type) {
    case 'select': {
      const raw = filterValues[filter.id]
      const value = typeof raw === 'string' ? raw : ''
      if (useBottomSheet) {
        return (
          <SelectFilterSheet filter={filter} value={value} onFilterChange={onFilterChange} />
        )
      }
      return (
        <EnhancedTextField
          {...commonProps}
          id={filter.id}
          key={filter.id}
          showLabel={false}
          select
          value={raw ?? ''}
          slotProps={{
            select: {
              displayEmpty: true,
              renderValue: () => filter.label,
              MenuProps: {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                PaperProps: {
                  sx: {
                    maxHeight: 320,
                    borderRadius: 2,
                  },
                },
              },
            },
            input: {
              startAdornment: filter.iconName ? (
                <InputAdornment position="start">
                  <Icon name={filter.iconName} size="sm" />
                </InputAdornment>
              ) : undefined,
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--mui-palette-Chip-defaultBorder)',
                },
                '& .MuiInputAdornment-root': {
                  marginRight: 'unset',
                },
              },
            },
          }}
          onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            onFilterChange(e.target.value, filter)
          }}
        >
          {filter.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </EnhancedTextField>
      )
    }

    case 'multi-select':
      return (
        <MultiSelect
          key={filter.id}
          label={filter.label}
          iconName={filter.iconName}
          options={filter.multiSelectOptions || []}
          value={(filterValues[filter.id] as string[]) ?? []}
          onChange={(values: string[]) => {
            onFilterChange(values, filter)
          }}
          placeholder={filter.placeholder}
          disabled={filter.disabled}
          width={filter.width}
          showSelectAll={filter.showSelectAll !== false}
          clearable={filter.clearable !== false}
          maxDisplayItems={filter.maxDisplayItems}
          showSelectedValuesInTrigger={false}
        />
      )

    case 'date-range':
      return (
        <ResponsiveDateRangeToolbarFilter
          key={filter.id}
          filter={filter}
          value={filterValues[filter.id]}
          onFilterChange={onFilterChange}
        />
      )

    default:
      return null
  }
}
