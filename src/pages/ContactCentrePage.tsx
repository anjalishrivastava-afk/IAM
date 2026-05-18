import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Icon, IconButton, Typography } from '@exotel-npm-dev/signal-design-system'
import { Tab, Tabs, MenuItem, Select, Divider } from '@mui/material'
import { useOnboarding } from '../context/OnboardingContext'

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart({ busy, available, offline }: { busy: number; available: number; offline: number }) {
  const total = busy + available + offline
  const r = 54
  const cx = 70
  const cy = 70
  const circumference = 2 * Math.PI * r

  const busyPct = total ? busy / total : 0
  const availPct = total ? available / total : 0
  const offPct = total ? offline / total : 0

  const busyDash = circumference * busyPct
  const availDash = circumference * availPct
  const offDash = circumference * offPct

  const busyOffset = 0
  const availOffset = -busyDash
  const offOffset = -(busyDash + availDash)

  return (
    <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={14} />
        {/* Busy (red) */}
        {busyDash > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EF4444" strokeWidth={14}
            strokeDasharray={`${busyDash} ${circumference}`}
            strokeDashoffset={busyOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
        {/* Available (green) */}
        {availDash > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22C55E" strokeWidth={14}
            strokeDasharray={`${availDash} ${circumference}`}
            strokeDashoffset={availOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
        {/* Offline (gray) */}
        {offDash > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#6B7280" strokeWidth={14}
            strokeDasharray={`${offDash} ${circumference}`}
            strokeDashoffset={offOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
      </svg>
      {/* Center content */}
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25,
      }}>
        <Icon name="user" size="sm" style={{ color: '#6B7280' }} />
        <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, color: 'text.primary' }}>
          {total}
        </Typography>
        <Typography sx={{ fontSize: 10, color: 'text.secondary', lineHeight: 1 }}>
          Total Agents
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCell({ label, value = 'N/A', change = 'N/A change', prev = 'N/A prev. day' }: {
  label: string; value?: string; change?: string; prev?: string
}) {
  return (
    <Box sx={{ minWidth: 160, flex: 1 }}>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: 'success.main', mt: 0.25 }}>{change}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{prev}</Typography>
    </Box>
  )
}

// ─── Left Sidebar ─────────────────────────────────────────────────────────────

const NAV_ICONS = ['phone', 'chat-circle', 'user', 'gear', 'sliders', 'list-bullets']

function ContactCentreSidebar({ onClose }: { onClose: () => void }) {
  const [active] = useState(0)
  return (
    <Box sx={{
      width: 56, minWidth: 56, height: '100%', bgcolor: 'background.paper',
      borderRight: '1px solid', borderColor: 'divider',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      py: 1, gap: 0.5,
    }}>
      {/* Close */}
      <IconButton onClick={onClose} sx={{ width: 36, height: 36, borderRadius: 1, color: 'text.secondary', mb: 0.5 }}>
        <Icon name="x" size="sm" />
      </IconButton>

      {/* Home — active */}
      <Box sx={{
        width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'primary.50', color: 'primary.main', cursor: 'pointer',
      }}>
        <Icon name="house" size="sm" />
      </Box>

      {/* Other nav icons */}
      {NAV_ICONS.map((icon, i) => (
        <Box key={icon} sx={{
          width: 36, height: 36, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: active === i + 1 ? 'primary.main' : 'text.secondary', cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}>
          <Icon name={icon} size="sm" />
        </Box>
      ))}

      <Box sx={{ flex: 1 }} />

      {/* Bottom actions */}
      <Box sx={{
        width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', mb: 0.5,
      }}>
        <Icon name="plus" size="sm" style={{ color: '#fff' }} />
      </Box>
      <IconButton sx={{ width: 36, height: 36, borderRadius: 1, color: 'text.secondary' }}>
        <Icon name="gear" size="sm" />
      </IconButton>
      <IconButton sx={{ width: 36, height: 36, borderRadius: 1, color: 'text.secondary' }}>
        <Icon name="user" size="sm" />
      </IconButton>
    </Box>
  )
}

// ─── Top Contextual Bar ───────────────────────────────────────────────────────

function ContactCentreTopBar() {
  const navigate = useNavigate()
  const { firstName } = useOnboarding()
  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'R'

  return (
    <Box sx={{
      height: 52, minHeight: 52, display: 'flex', alignItems: 'center',
      px: 2, gap: 2, borderBottom: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper', flexShrink: 0,
    }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
        <Typography
          onClick={() => navigate('/')}
          sx={{ fontSize: 13, color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
        >
          Home
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>/</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>Zomato</Typography>
          <Icon name="caret-down" size="xs" style={{ color: '#6B7280' }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Search */}
      <IconButton sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary' }}>
        <Icon name="magnifying-glass" size="sm" />
      </IconButton>

      {/* Workspace selector */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.75,
        border: '1px solid', borderColor: 'divider', borderRadius: 1,
        px: 1.5, py: 0.5, cursor: 'pointer',
      }}>
        <Icon name="file-text" size="sm" style={{ color: '#6B7280' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.primary' }}>Enterprise Shared Cloud</Typography>
        <Icon name="caret-down" size="xs" style={{ color: '#6B7280' }} />
      </Box>

      {/* Credits */}
      <Box sx={{
        border: '1px solid', borderColor: 'success.200', borderRadius: 1,
        px: 1.5, py: 0.5, bgcolor: 'success.50',
      }}>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'success.main', lineHeight: 1.3 }}>
          Credits: ₹1,293
        </Typography>
        <Typography sx={{ fontSize: 10, color: 'error.main' }}>~ 6 days at current usage</Typography>
      </Box>

      {/* Bell */}
      <IconButton sx={{ width: 32, height: 32, borderRadius: 1, color: 'text.secondary', position: 'relative' }}>
        <Icon name="bell" size="sm" />
        <Box sx={{
          position: 'absolute', top: 6, right: 6, width: 7, height: 7,
          bgcolor: 'error.main', borderRadius: '50%',
        }} />
      </IconButton>

      {/* Avatar */}
      <Box sx={{
        width: 30, height: 30, bgcolor: 'primary.light', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'primary.contrastText' }}>{initial}</Typography>
      </Box>
    </Box>
  )
}

// ─── Live Status Dot ──────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.4,
      bgcolor: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: 1,
      px: 0.75, py: 0.125,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16A34A', flexShrink: 0 }} />
      <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#15803D', letterSpacing: '0.3px' }}>LIVE</Typography>
    </Box>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ContactCentrePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [activityTab, setActivityTab] = useState(0)

  const busy = 0, available = 21, offline = 7

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* Left sidebar */}
      <ContactCentreSidebar onClose={() => navigate('/')} />

      {/* Right panel */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Top bar */}
        <ContactCentreTopBar />

        {/* Tab navigation */}
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
            minHeight: 44,
            '& .MuiTab-root': { minHeight: 44, fontSize: 13, fontWeight: 500, textTransform: 'none', px: 1.5, py: 0 },
            '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
          }}>
            <Tab label="Overview" />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>Agent Activity<LiveBadge /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>Group Activity<LiveBadge /></Box>} />
            <Tab label="Agent Performance" />
            <Tab label="Group Performance" />
          </Tabs>
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Filter row */}
          <Box>
            <Select
              value="all"
              size="small"
              sx={{ fontSize: 13, fontWeight: 500, borderRadius: 1, minWidth: 130,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              }}
            >
              <MenuItem value="all">All Calls</MenuItem>
              <MenuItem value="inbound">Inbound</MenuItem>
              <MenuItem value="outbound">Outbound</MenuItem>
            </Select>
          </Box>

          {/* Live cards row */}
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>

            {/* Live Calls card */}
            <Box sx={{
              flex: '1 1 380px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
              borderRadius: 2, p: 2.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>Live Calls</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Incoming */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <Icon name="phone-incoming" size="sm" style={{ color: '#6B7280' }} />
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Incoming On Call Flow</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 3.5 }}>
                    {[['In Progress:', 0], ['In Queue:', 0]].map(([label, val]) => (
                      <Box key={label as string} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E', flexShrink: 0 }} />
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label as string}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{val as number}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider />

                {/* Outgoing */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <Icon name="phone-outgoing" size="sm" style={{ color: '#6B7280' }} />
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Outgoing</Typography>
                  </Box>
                  <Box sx={{ pl: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>In Progress:</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>0</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Total */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 36, fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>0</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>Total Calls</Typography>
              </Box>
            </Box>

            {/* Live Agent Status card */}
            <Box sx={{
              flex: '1 1 340px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
              borderRadius: 2, p: 2.5,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>Live Agent Status</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <DonutChart busy={busy} available={available} offline={offline} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { color: '#EF4444', label: 'Busy:', value: busy },
                    { color: '#22C55E', label: 'Available:', value: available },
                    { color: '#6B7280', label: 'Offline:', value: offline },
                  ].map(({ color, label, value }) => (
                    <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Today's Activity */}
          <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, pt: 2, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>Today's Activity</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>last updated 25 minutes ago</Typography>
                <IconButton sx={{ width: 24, height: 24, color: 'text.disabled' }}>
                  <Icon name="arrow-clockwise" size="xs" />
                </IconButton>
              </Box>
            </Box>

            {/* Sub-tabs */}
            <Box sx={{ px: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tabs value={activityTab} onChange={(_, v) => setActivityTab(v)} sx={{
                minHeight: 40,
                '& .MuiTab-root': { minHeight: 40, fontSize: 13, fontWeight: 500, textTransform: 'none', px: 0, mr: 2.5, py: 0 },
                '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
              }}>
                <Tab label="Incoming On Call Flow" />
                <Tab label="Outgoing" />
              </Tabs>
            </Box>

            {/* Metric label row (top right) */}
            <Box sx={{ px: 2.5, pt: 1.5, pb: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                <Typography sx={{ fontSize: 12, color: 'primary.main', fontWeight: 500 }}>Today so far</Typography>
                <Icon name="caret-down" size="xs" style={{ color: '#394FB6' }} />
              </Box>
            </Box>

            {/* Metrics grid */}
            <Box sx={{ px: 2.5, pt: 1.5, pb: 2.5, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {[
                'Call Volume', 'Completed Calls', 'Abandoned in IVR', 'Abandoned in Queue', 'Agent Unanswered',
                'Avg. Talk Time', 'Avg. Queue Time', 'Longest Queue Time', 'Avg. Abandon Time', 'Avg. Speed of Answer',
              ].map(label => (
                <MetricCell key={label} label={label} />
              ))}
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  )
}
