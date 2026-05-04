/**
 * Minimal loading skeleton aligned with Role / Privilege detail shells (hero + Basic Details + follow-on sections).
 */
import Skeleton from '@mui/material/Skeleton'
import { Box, Divider, Paper, Stack } from '@exotel-npm-dev/signal-design-system'

const SECTION_LEFT_COL_MAX_PX = 324
const SECTION_GAP_PX = 200

const SECTION_ROW_LAYOUT = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'flex-start',
  gap: { xs: 2, md: `${SECTION_GAP_PX}px` },
  py: { xs: 2, md: 2.5 },
} as const

const SECTION_ASIDE_BOX = {
  flexShrink: 0,
  width: '100%',
  maxWidth: { md: SECTION_LEFT_COL_MAX_PX },
}

const SECTION_CONTENT_STACK = {
  flexShrink: 0,
  width: '100%',
  minWidth: 0,
  maxWidth: { md: 506 },
}

function SkeletonField({ tall }: { tall?: boolean }) {
  return (
    <Skeleton variant="rounded" height={tall ? 92 : 56} sx={{ borderRadius: 1, transform: 'none' }} />
  )
}

function SectionAsideTitles() {
  return (
    <Box sx={SECTION_ASIDE_BOX}>
      <Skeleton variant="rounded" width="72%" height={22} sx={{ transform: 'none' }} />
      <Skeleton variant="rounded" width="94%" height={14} sx={{ mt: 0.75, transform: 'none' }} />
      <Skeleton variant="rounded" width="55%" height={14} sx={{ mt: 0.5, transform: 'none' }} />
    </Box>
  )
}

export function DetailPageLoadingSkeleton({
  showPrivilegeSidebar = false,
}: {
  /**
   * When true, matches privilege set “Select privileges” lane + accordion block.
   * Role detail omits this for a tighter skeleton.
   */
  showPrivilegeSidebar?: boolean
}) {
  return (
    <Box
      sx={{ height: '100%', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}
      aria-busy="true"
      aria-live="polite"
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{
            px: 2,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
            <Skeleton variant="rounded" width={32} height={32} sx={{ flexShrink: 0, transform: 'none' }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Skeleton variant="rounded" width={220} height={28} sx={{ transform: 'none' }} />
                <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: 1, transform: 'none' }} />
              </Stack>
              <Skeleton variant="rounded" height={18} sx={{ mt: 0.75, maxWidth: 420, width: '100%', transform: 'none' }} />
              <Skeleton variant="rounded" height={18} sx={{ mt: 0.5, maxWidth: 360, width: '100%', transform: 'none' }} />
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
            <Skeleton variant="rounded" width={72} height={36} sx={{ transform: 'none' }} />
            <Skeleton variant="rounded" width={36} height={36} sx={{ transform: 'none' }} />
          </Stack>
        </Stack>

        <Box sx={{ px: 2, pb: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Stack spacing={2} sx={{ ...SECTION_ROW_LAYOUT, py: { xs: 2, md: 2.5 } }}>
            <SectionAsideTitles />
            <Stack spacing={2} sx={SECTION_CONTENT_STACK}>
              <SkeletonField />
              <SkeletonField tall />
            </Stack>
          </Stack>

          <Divider sx={{ mx: -2 }} />

          <Stack spacing={2} sx={{ ...SECTION_ROW_LAYOUT, pt: { xs: 2, md: 2.5 } }}>
            <SectionAsideTitles />
            <Stack spacing={1.5} sx={SECTION_CONTENT_STACK}>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {[88, 96, 72, 104].map((w) => (
                  <Skeleton
                    key={w}
                    variant="rounded"
                    width={w}
                    height={28}
                    sx={{ borderRadius: 2, transform: 'none' }}
                  />
                ))}
              </Stack>
              <Skeleton variant="rounded" width="52%" height={16} sx={{ transform: 'none' }} />
              <Skeleton variant="rounded" width={148} height={20} sx={{ transform: 'none' }} />
            </Stack>
          </Stack>

          <Divider sx={{ mx: -2 }} />

          <Stack spacing={1.25} sx={{ py: { xs: 2, md: 2.5 } }}>
            <Skeleton variant="rounded" width="52%" height={24} sx={{ transform: 'none' }} />
            <Skeleton variant="rounded" width="88%" height={16} sx={{ transform: 'none' }} />
            <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1, mt: 0.25, transform: 'none' }} />
          </Stack>

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ alignItems: { lg: 'flex-start' }, pb: 2 }}
          >
            {showPrivilegeSidebar ? (
              <>
                <Stack
                  spacing={1}
                  sx={{
                    width: '100%',
                    maxWidth: { lg: 248 },
                    flexShrink: 0,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rounded" height={34} sx={{ transform: 'none' }} />
                  ))}
                </Stack>
                <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1, transform: 'none' }} />
                  ))}
                </Stack>
              </>
            ) : (
              <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: 1, transform: 'none' }} />
                ))}
              </Stack>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
