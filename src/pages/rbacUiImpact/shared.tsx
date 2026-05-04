import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

export function DiscardChangesDialog({
  open,
  onKeepEditing,
  onDiscard,
}: {
  open: boolean
  onKeepEditing: () => void
  onDiscard: () => void
}) {
  return (
    <Dialog open={open} onClose={onKeepEditing} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Discard changes?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          You have unsaved changes. If you leave now, your changes will be lost.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" color="neutral" size="medium" onClick={() => onKeepEditing()}>
          Keep editing
        </Button>
        <Button variant="contained" color="error" size="medium" onClick={() => onDiscard()}>
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function DiscardRoleProgressDialog({
  open,
  onKeepEditing,
}: {
  open: boolean
  onKeepEditing: () => void
}) {
  return (
    <Dialog open={open} onClose={onKeepEditing} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Discard this role?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Your progress will be lost. If you want to come back to this later, save it as a draft first.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="primary" size="medium" onClick={() => onKeepEditing()}>
          Keep editing
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function DirtyPulseLabel({ count }: { count: number }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        component="span"
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: 'warning.main',
          animation: 'rbacPulse 1.2s ease-in-out infinite',
          '@keyframes rbacPulse': {
            '0%, 100%': { opacity: 1, transform: 'scale(1)' },
            '50%': { opacity: 0.45, transform: 'scale(0.92)' },
          },
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        • {count} unsaved change{count === 1 ? '' : 's'}
      </Typography>
    </Stack>
  )
}
