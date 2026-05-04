import { useMemo, useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import {
  Card,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DateTimeRangePicker,
  Grid,
  PageHeader,
  Paper,
  Stack,
  TimePicker,
  TimeRangePicker,
  Typography,
  type DateRange,
  type DateRangeShortcut,
} from '@exotel-npm-dev/signal-design-system'

const fieldSlot = { textField: { size: 'small' as const, fullWidth: true } }

function VariantCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
        {children}
      </Stack>
    </Card>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
      {children}
    </Typography>
  )
}

export function DateTimeShowcasePage() {
  const [dateControlled, setDateControlled] = useState<Dayjs | null>(dayjs())
  const [timeControlled, setTimeControlled] = useState<Dayjs | null>(dayjs())
  const [dateTimeControlled, setDateTimeControlled] = useState<Dayjs | null>(dayjs())
  const [dateRangeControlled, setDateRangeControlled] = useState<DateRange<Dayjs>>([null, null])
  const [timeRangeControlled, setTimeRangeControlled] = useState<DateRange<Dayjs>>([null, null])
  const [dateTimeRangeControlled, setDateTimeRangeControlled] = useState<DateRange<Dayjs>>([null, null])

  const customDateRangeShortcuts: DateRangeShortcut[] = useMemo(
    () => [
      { label: 'Today', getValue: () => [dayjs().startOf('day'), dayjs().endOf('day')] },
      { label: 'This week', getValue: () => [dayjs().startOf('week'), dayjs().endOf('week')] },
      { label: 'This month', getValue: () => [dayjs().startOf('month'), dayjs().endOf('month')] },
    ],
    [],
  )

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        p: 2,
        minHeight: '100%',
        backgroundColor: 'surface.elevation1',
      }}
    >
      <Stack spacing={3}>
        <PageHeader
          title="Date & time pickers"
          subtitle="Signal Design System wrapped pickers — variants aligned with component stories"
        />

        <SectionTitle>DatePicker</SectionTitle>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Basic" description="Label + default field">
              <DatePicker label="Select date" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Controlled" description="Value synced to caption">
              <DatePicker label="Date" value={dateControlled} onChange={setDateControlled} slotProps={fieldSlot} />
              <Typography variant="caption" color="text.secondary">
                Selected: {dateControlled ? dateControlled.format('MMMM D, YYYY') : 'None'}
              </Typography>
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Without label" description="Field only">
              <DatePicker slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Disabled">
              <DatePicker label="Disabled" disabled defaultValue={dayjs()} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Read only">
              <DatePicker label="Read only" readOnly defaultValue={dayjs()} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Disable past" description="Future dates only">
              <DatePicker label="Future dates only" disablePast slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Disable future" description="Past dates only">
              <DatePicker label="Past dates only" disableFuture slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Min / max" description="Current month">
              <DatePicker
                label="This month only"
                minDate={dayjs().startOf('month')}
                maxDate={dayjs().endOf('month')}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Month & year" description="No day view">
              <DatePicker label="Select month" views={['month', 'year']} openTo="month" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Year only">
              <DatePicker label="Select year" views={['year']} openTo="year" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Custom format" description="DD/MM/YYYY">
              <DatePicker label="DD/MM/YYYY format" format="DD/MM/YYYY" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
        </Grid>

        <SectionTitle>TimePicker</SectionTitle>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Basic">
              <TimePicker label="Select time" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Controlled">
              <TimePicker label="Time" value={timeControlled} onChange={setTimeControlled} slotProps={fieldSlot} />
              <Typography variant="caption" color="text.secondary">
                Selected: {timeControlled ? timeControlled.format('hh:mm A') : 'None'}
              </Typography>
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Without label">
              <TimePicker slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Disabled">
              <TimePicker label="Disabled" disabled defaultValue={dayjs()} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Read only">
              <TimePicker label="Read only" readOnly defaultValue={dayjs()} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="24-hour" description="ampm=false">
              <TimePicker label="24-hour format" ampm={false} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="With seconds">
              <TimePicker
                label="Include seconds"
                views={['hours', 'minutes', 'seconds']}
                format="hh:mm:ss A"
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Min / max time" description="9 AM – 5 PM">
              <TimePicker
                label="Business hours (9 AM – 5 PM)"
                minTime={dayjs().hour(9).minute(0)}
                maxTime={dayjs().hour(17).minute(0)}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
        </Grid>

        <SectionTitle>DateTimePicker</SectionTitle>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Basic">
              <DateTimePicker label="Select date & time" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Controlled">
              <DateTimePicker
                label="Date & time"
                value={dateTimeControlled}
                onChange={setDateTimeControlled}
                slotProps={fieldSlot}
              />
              <Typography variant="caption" color="text.secondary">
                Selected: {dateTimeControlled ? dateTimeControlled.format('MMMM D, YYYY hh:mm A') : 'None'}
              </Typography>
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Without label">
              <DateTimePicker slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Disabled">
              <DateTimePicker label="Disabled" disabled defaultValue={dayjs()} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Read only">
              <DateTimePicker label="Read only" readOnly defaultValue={dayjs()} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Disable past">
              <DateTimePicker label="Future only" disablePast slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="24-hour">
              <DateTimePicker label="24-hour format" ampm={false} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <VariantCard title="Custom format">
              <DateTimePicker label="Custom format" format="DD/MM/YYYY HH:mm" ampm={false} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
        </Grid>

        <SectionTitle>DateRangePicker</SectionTitle>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Basic" description="Default shortcuts panel">
              <DateRangePicker label="Select date range" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Controlled">
              <DateRangePicker
                label="Date range"
                value={dateRangeControlled}
                onChange={setDateRangeControlled}
                slotProps={fieldSlot}
              />
              <Typography variant="caption" color="text.secondary">
                Start: {dateRangeControlled[0] ? dateRangeControlled[0].format('MMMM D, YYYY') : 'None'} — End:{' '}
                {dateRangeControlled[1] ? dateRangeControlled[1].format('MMMM D, YYYY') : 'None'}
              </Typography>
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Without label">
              <DateRangePicker slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Disabled">
              <DateRangePicker
                label="Disabled"
                disabled
                defaultValue={[dayjs(), dayjs().add(7, 'day')]}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Read only">
              <DateRangePicker
                label="Read only"
                readOnly
                defaultValue={[dayjs(), dayjs().add(7, 'day')]}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Disable past">
              <DateRangePicker label="Future dates only" disablePast slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Single calendar" description="calendars={1}">
              <DateRangePicker label="Single calendar" calendars={1} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Min / max" description="Current month">
              <DateRangePicker
                label="This month only"
                minDate={dayjs().startOf('month')}
                maxDate={dayjs().endOf('month')}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Without shortcuts" description="shortcuts={false}">
              <DateRangePicker label="Without shortcuts" shortcuts={false} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Custom shortcuts">
              <DateRangePicker label="With custom shortcuts" shortcuts={customDateRangeShortcuts} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
        </Grid>

        <SectionTitle>TimeRangePicker</SectionTitle>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Basic">
              <TimeRangePicker label="Select time range" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Controlled">
              <TimeRangePicker
                label="Time range"
                value={timeRangeControlled}
                onChange={setTimeRangeControlled}
                slotProps={fieldSlot}
              />
              <Typography variant="caption" color="text.secondary">
                Start: {timeRangeControlled[0] ? timeRangeControlled[0].format('hh:mm A') : 'None'} — End:{' '}
                {timeRangeControlled[1] ? timeRangeControlled[1].format('hh:mm A') : 'None'}
              </Typography>
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Without label">
              <TimeRangePicker slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Disabled">
              <TimeRangePicker
                label="Disabled"
                disabled
                defaultValue={[dayjs().hour(9).minute(0), dayjs().hour(17).minute(0)]}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Read only">
              <TimeRangePicker
                label="Read only"
                readOnly
                defaultValue={[dayjs().hour(9).minute(0), dayjs().hour(17).minute(0)]}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="24-hour">
              <TimeRangePicker label="24-hour format" ampm={false} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Business hours" description="Default 9–5">
              <TimeRangePicker
                label="Business hours"
                defaultValue={[dayjs().hour(9).minute(0), dayjs().hour(17).minute(0)]}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
        </Grid>

        <SectionTitle>DateTimeRangePicker</SectionTitle>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Basic" description="Default shortcuts">
              <DateTimeRangePicker label="Select date-time range" slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Controlled">
              <DateTimeRangePicker
                label="Date-time range"
                value={dateTimeRangeControlled}
                onChange={setDateTimeRangeControlled}
                slotProps={fieldSlot}
              />
              <Typography variant="caption" color="text.secondary">
                Start: {dateTimeRangeControlled[0] ? dateTimeRangeControlled[0].format('MMM D, YYYY hh:mm A') : 'None'} — End:{' '}
                {dateTimeRangeControlled[1] ? dateTimeRangeControlled[1].format('MMM D, YYYY hh:mm A') : 'None'}
              </Typography>
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Without label">
              <DateTimeRangePicker slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Disabled">
              <DateTimeRangePicker
                label="Disabled"
                disabled
                defaultValue={[dayjs(), dayjs().add(3, 'day').hour(17).minute(0)]}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Read only">
              <DateTimeRangePicker
                label="Read only"
                readOnly
                defaultValue={[dayjs(), dayjs().add(3, 'day').hour(17).minute(0)]}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Disable past">
              <DateTimeRangePicker label="Future only" disablePast slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="24-hour">
              <DateTimeRangePicker label="24-hour format" ampm={false} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Min / max" description="Current month">
              <DateTimeRangePicker
                label="This month only"
                minDateTime={dayjs().startOf('month')}
                maxDateTime={dayjs().endOf('month')}
                slotProps={fieldSlot}
              />
            </VariantCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <VariantCard title="Without shortcuts" description="shortcuts={false}">
              <DateTimeRangePicker label="Without shortcuts" shortcuts={false} slotProps={fieldSlot} />
            </VariantCard>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ pb: 2, display: 'block' }}>
          Localization uses dayjs via ExotelThemeProvider (see main.tsx); no extra LocalizationProvider is required on this page.
        </Typography>
      </Stack>
    </Paper>
  )
}
