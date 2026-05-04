import { EnhancedTextField, Paper, Typography } from '@exotel-npm-dev/signal-design-system'

export function MainContent({ label }: { label: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        p: 3,
        minHeight: '100%'
      }}
    >
      <Typography variant="body1">This is {label} page</Typography>
      <EnhancedTextField label="Name" placeholder='Enter your name' size="small" />
    </Paper>
  )
}
