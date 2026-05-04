import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import StepConnector from '@mui/material/StepConnector'
import StepLabel from '@mui/material/StepLabel'
import MuiStepper from '@mui/material/Stepper'
import type { StepIconProps } from '@mui/material/StepIcon'
import Snackbar from '@mui/material/Snackbar'
import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'
import { alpha, styled } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  EnhancedTextField,
  FormControlLabel,
  Icon,
  IconButton,
  Link,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  getInitials,
} from '@exotel-npm-dev/signal-design-system'

import { RBAC_IMPACT_BASE } from './constants'
import { DiscardRoleProgressDialog } from './shared'

const steps = ['Details', 'Permissions', 'Users', 'Review']

function snackSlide(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

const IndigoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.Mui-active .MuiStepConnector-line`]: { borderColor: theme.palette.primary.main },
  [`&.Mui-completed .MuiStepConnector-line`]: { borderColor: theme.palette.primary.main },
}))

function RoleStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props
  if (completed) {
    return (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: 'primary.dark',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.contrastText',
        }}
      >
        <Icon name="check" size="xs" weight="bold" />
      </Box>
    )
  }
  const n = typeof icon === 'number' ? icon : Number(icon)
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: active ? 'primary.main' : 'grey.300',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? 'primary.contrastText' : 'text.secondary',
        fontWeight: 800,
        fontSize: 13,
        boxShadow: active ? (t: Theme) => `0 0 0 4px ${alpha(t.palette.primary.main, 0.28)}` : 'none',
      }}
    >
      {n}
    </Box>
  )
}

type PermKey = 'live' | 'intervene' | 'agent' | 'qa' | 'reporting' | 'users'
const PERM_DEF: Record<PermKey, string> = {
  live: 'Live monitoring',
  intervene: 'Call intervention',
  agent: 'Agent state management',
  qa: 'Call recordings & QA',
  reporting: 'Reporting & dashboards',
  users: 'User management',
}

const USERS_SEED = [
  { id: 'u1', name: 'Aditya Pratap Singh', email: 'aditya.p@hdfc.bank', branch: 'Bangalore Branch 1' },
  { id: 'u2', name: 'Rashika Jain', email: 'rashika.j@hdfc.bank', branch: 'Mumbai Branch 12' },
  { id: 'u3', name: 'Rudrakshula P.', email: 'rudra.p@hdfc.bank', branch: 'Delhi Branch 3' },
  { id: 'u4', name: 'Anjali Srivastava', email: 'anjali.s@hdfc.bank', branch: 'Pune Branch 7' },
]

export function PatternStepperRoleDemoPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [template, setTemplate] = useState<'blank' | 'supervisor' | 'qa'>('blank')
  const [perms, setPerms] = useState<Record<PermKey, boolean>>({
    live: false,
    intervene: false,
    agent: false,
    qa: false,
    reporting: false,
    users: false,
  })
  const [userSel, setUserSel] = useState<Record<string, boolean>>({})
  const [userSearch, setUserSearch] = useState('')
  const [discardOpen, setDiscardOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const progressMade = useMemo(() => {
    if (roleName.trim() || description.trim()) return true
    if (template !== 'blank') return true
    if (Object.values(perms).some(Boolean)) return true
    if (Object.values(userSel).some(Boolean)) return true
    return false
  }, [roleName, description, template, perms, userSel])

  const filteredUsers = USERS_SEED.filter((u) =>
    `${u.name}${u.email}${u.branch}`.toLowerCase().includes(userSearch.trim().toLowerCase()),
  )
  const selectedUsersCount = USERS_SEED.filter((u) => userSel[u.id]).length
  const togglePerm = (key: PermKey) => setPerms((p) => ({ ...p, [key]: !p[key] }))
  const toggleUser = (id: string) => setUserSel((s) => ({ ...s, [id]: !s[id] }))
  const tryClose = () => {
    if (progressMade) setDiscardOpen(true)
    else navigate(RBAC_IMPACT_BASE)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.02), display: 'flex', flexDirection: 'column' }}>
      <Box component="header" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', px: { xs: 2, sm: 3 }, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Link component={RouterLink} to={RBAC_IMPACT_BASE} underline="hover" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
            ← Back to all patterns
          </Link>
          <Stack alignItems="center" spacing={0.35} sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary' }}>
              New role
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, monospace', color: 'text.secondary' }}>
              Step {activeStep + 1} of 4
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {activeStep < 3 ? (
              <Button variant="text" color="inherit" size="small" sx={{ fontWeight: 600 }} onClick={() => setToastMsg('Draft saved')}>
                Save as draft
              </Button>
            ) : null}
            <IconButton size="small" variant="outlined" aria-label="Close" onClick={tryClose}>
              <Icon name="x" size="sm" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, flex: 1 }}>
        <MuiStepper nonLinear activeStep={activeStep} alternativeLabel connector={<IndigoConnector />} sx={{ maxWidth: 780, mx: 'auto', mb: 4 }}>
          {steps.map((label, index) => {
            const completed = index < activeStep
            return (
              <Step key={label} completed={completed}>
                <StepButton
                  onClick={() => completed && setActiveStep(index)}
                  disabled={!completed && index !== activeStep}
                  sx={{ '& .MuiStepLabel-label': { fontWeight: index === activeStep ? 800 : 500, fontSize: 13 } }}
                >
                  <StepLabel slots={{ stepIcon: RoleStepIcon }}>{label}</StepLabel>
                </StepButton>
              </Step>
            )
          })}
        </MuiStepper>

        <Box sx={{ maxWidth: 680, mx: 'auto' }}>
          {activeStep === 0 ? (
            <StepPanel title="Role details" sub="Give this role a clear name and description so other admins know what it does">
              <EnhancedTextField
                required
                label="Role name"
                helperText="Must be unique within this workspace"
                fullWidth
                value={roleName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRoleName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <EnhancedTextField
                label="Description"
                helperText="The description should be clear enough that anyone can see what this role allows"
                fullWidth
                multiline
                minRows={3}
                value={description}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Start from
              </Typography>
              <RadioGroup value={template} onChange={(e) => setTemplate(e.target.value as typeof template)}>
                <Stack spacing={1.5}>
                  <TemplateRadio value="blank" title="Blank role" subtitle="No pre-selected permissions" current={template} />
                  <TemplateRadio value="supervisor" title="Clone Supervisor" subtitle="Monitoring and agent coaching defaults" current={template} />
                  <TemplateRadio value="qa" title="Clone QA Evaluator" subtitle="Quality and recording review defaults" current={template} />
                </Stack>
              </RadioGroup>
            </StepPanel>
          ) : null}

          {activeStep === 1 ? (
            <StepPanel title="Permission sets" sub="Choose the capability bundles this role has access to">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {(Object.keys(PERM_DEF) as PermKey[]).map((k) => {
                  const selected = perms[k]
                  return (
                    <Paper
                      key={k}
                      variant="outlined"
                      onClick={() => togglePerm(k)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? (t: Theme) => alpha(t.palette.primary.main, 0.08) : 'background.paper',
                        borderWidth: 2,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Checkbox checked={selected} tabIndex={-1} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {PERM_DEF[k]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Capability bundle
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )
                })}
              </Box>
            </StepPanel>
          ) : null}

          {activeStep === 2 ? (
            <StepPanel title="Assign users" sub="You can assign users now or do it later from the Users tab. This step is optional.">
              <EnhancedTextField
                showLabel={false}
                placeholder="Search users"
                size="medium"
                fullWidth
                value={userSearch}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box component="span" sx={{ mr: 1, display: 'inline-flex' }}>
                        <Icon name="magnifying-glass" size="sm" sx={{ opacity: 0.55 }} />
                      </Box>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                <Chip size="small" label="Branch" variant="tonal" color="default" />
                <Chip size="small" label="Role" variant="tonal" color="default" />
                <Chip size="small" label="Status" variant="tonal" color="default" />
              </Stack>
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {filteredUsers.map((u) => (
                  <Stack
                    key={u.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-of-type': { borderBottom: 'none' },
                    }}
                  >
                    <Checkbox checked={Boolean(userSel[u.id])} onChange={() => toggleUser(u.id)} />
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.dark', fontSize: 13 }}>{getInitials(u.name)}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {u.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {u.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {u.branch}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Paper>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {selectedUsersCount} user{selectedUsersCount === 1 ? '' : 's'} selected
              </Typography>
            </StepPanel>
          ) : null}

          {activeStep === 3 ? (
            <StepPanel title="Review and create" sub="Confirm the details before creating this role. All changes are logged in the audit trail.">
              <ReviewRow label="Role name" value={roleName.trim() || '(not set)'} onEdit={() => setActiveStep(0)} />
              <ReviewRow label="Description" value={description.trim() || '(not set)'} onEdit={() => setActiveStep(0)} />
              <ReviewRow
                label="Starting template"
                value={template === 'blank' ? 'Blank role' : template === 'supervisor' ? 'Clone Supervisor' : 'Clone QA Evaluator'}
                onEdit={() => setActiveStep(0)}
              />
              <ReviewRow
                label="Permission sets"
                value={
                  (Object.keys(perms) as PermKey[]).some((k) => perms[k])
                    ? (Object.keys(perms) as PermKey[])
                        .filter((k) => perms[k])
                        .map((k) => PERM_DEF[k])
                        .join(', ')
                    : 'No permissions selected'
                }
                onEdit={() => setActiveStep(1)}
              />
              <ReviewRow label="Users" value={selectedUsersCount ? `${selectedUsersCount} selected` : 'No users assigned'} onEdit={() => setActiveStep(2)} />
            </StepPanel>
          ) : null}
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 120 }}>
          {activeStep > 0 ? (
            <Button variant="outlined" color="neutral" size="medium" onClick={() => setActiveStep((s) => s - 1)}>
              ← Previous
            </Button>
          ) : null}
        </Box>
        <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, monospace', color: 'text.secondary', textAlign: 'center', flex: 1 }}>
          Step {activeStep + 1} of 4 — {steps[activeStep]}
        </Typography>
        <Box sx={{ minWidth: 160, display: 'flex', justifyContent: 'flex-end' }}>
          {activeStep < 3 ? (
            <Button variant="contained" color="primary" size="medium" disabled={activeStep === 0 && !roleName.trim()} onClick={() => setActiveStep((s) => s + 1)}>
              Next →
            </Button>
          ) : (
            <Button variant="contained" color="primary" size="medium" onClick={() => setToastMsg('Role created')}>
              Create role
            </Button>
          )}
        </Box>
      </Box>

      <DiscardRoleProgressDialog open={discardOpen} onKeepEditing={() => setDiscardOpen(false)} />

      <Snackbar
        open={Boolean(toastMsg)}
        autoHideDuration={3200}
        onClose={() => setToastMsg(null)}
        TransitionComponent={snackSlide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={
          <Stack direction="row" spacing={1} alignItems="center">
            <Icon name="check-circle" size="sm" sx={{ color: 'success.light' }} />
            {toastMsg}
          </Stack>
        }
      />
    </Box>
  )
}

function TemplateRadio({
  value,
  title,
  subtitle,
  current,
}: {
  value: 'blank' | 'supervisor' | 'qa'
  title: string
  subtitle: string
  current: typeof value
}) {
  const selected = current === value
  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: selected ? 'primary.main' : 'divider', borderWidth: 2 }}>
      <FormControlLabel
        sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
        control={<Radio value={value} checked={selected} />}
        label={
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>
        }
        labelPlacement="end"
      />
    </Paper>
  )
}

function StepPanel({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography component="h2" sx={{ fontFamily: '"Noto Serif", Georgia, serif', fontSize: '1.5rem', fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.65 }}>
        {sub}
      </Typography>
      {children}
    </Paper>
  )
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', alignItems: { sm: 'flex-start' } }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 148 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flex: 1 }} alignItems="flex-start" justifyContent="space-between">
        <Typography variant="body2" sx={{ flex: 1 }}>
          {value}
        </Typography>
        <Link component="button" type="button" onClick={onEdit} sx={{ cursor: 'pointer', bgcolor: 'transparent', border: 'none', padding: 0 }}>
          Edit
        </Link>
      </Stack>
    </Stack>
  )
}
