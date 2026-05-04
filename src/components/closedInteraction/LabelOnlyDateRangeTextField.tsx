import { forwardRef } from 'react'
import type { TextFieldProps } from '@mui/material/TextField'
import { EnhancedTextField } from '@exotel-npm-dev/signal-design-system'

export type LabelOnlyDateRangeTextFieldProps = TextFieldProps & {
  filterLabel: string
}

/**
 * Date range toolbar trigger: shows category label only; range appears in applied-filter chips.
 * Merges `InputProps` so callers can add e.g. a Phosphor calendar adornment.
 */
export const LabelOnlyDateRangeTextField = forwardRef<HTMLDivElement, LabelOnlyDateRangeTextFieldProps>(
  function LabelOnlyDateRangeTextField(props, ref) {
    const { filterLabel, value: _ignored, InputProps, ...rest } = props
    const restField = rest as TextFieldProps
    return (
      <EnhancedTextField
        ref={ref}
        {...restField}
        showLabel={false}
        value={filterLabel}
        InputProps={{
          ...restField.InputProps,
          ...InputProps,
          readOnly: true,
        }}
      />
    )
  },
)

LabelOnlyDateRangeTextField.displayName = 'LabelOnlyDateRangeTextField'
