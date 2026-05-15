import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import MenuItem from '@mui/material/MenuItem'
import type { Theme } from '@mui/material/styles'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  EnhancedTextField,
  FormControlLabel,
  Icon,
  IconButton,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'

// ─── Static data ──────────────────────────────────────────────────────────────

const ROLE_OPTIONS = ['Admin', 'Manager', 'Member', 'Auditor']
const TENANT_OPTIONS = ['Acme Corp', 'Techsmart Inc', 'Global Services', 'Digital Solutions']

// ─── Section row ──────────────────────────────────────────────────────────────

function SectionRow({
  label,
  description,
  children,
  noDivider,
}: {
  label: string
  description?: string
  children: React.ReactNode
  noDivider?: boolean
}) {
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: { xs: 2, md: 4 },
          px: 3,
          py: 3,
          alignItems: 'flex-start',
        }}
      >
        {/* Left: label + description */}
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary', lineHeight: 1.4 }}>
            {label}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
              {description}
            </Typography>
          )}
        </Box>

        {/* Right: form fields */}
        <Box>{children}</Box>
      </Box>
      {!noDivider && <Divider />}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CreateUserPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Member',
    tenants: [] as string[],
    enforceMfa: false,
    sendInvitation: true,
  })

  const [showConfirm, setShowConfirm] = useState(false)

  const patch = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }))

  const handleSave = () => {
    navigate(-1)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* ── Page header ──────────────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 3, py: 1.75, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <IconButton
          size="small"
          variant="outlined"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <Icon name="arrow-left" size="sm" />
        </IconButton>
        <Typography variant="title3" sx={{ fontWeight: 700 }}>
          Create User
        </Typography>
      </Stack>

      {/* ── Scrollable content ───────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>

        {/* Basic details */}
        <SectionRow
          label="Basic details"
          description="Essential details for identifying and contacting the user"
        >
          <EnhancedTextField
            label="Full Name"
            placeholder="John Doe"
            value={form.fullName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => patch('fullName', e.target.value)}
            fullWidth size="large"
          />
        </SectionRow>

        {/* Email Address */}
        <SectionRow
          label="Email Address"
          description="Set secure login credentials for the user"
        >
          <Stack spacing={2}>
            <EnhancedTextField
              label="Email Address"
              placeholder="john.doe@company.com"
              type="email"
              value={form.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => patch('email', e.target.value)}
              fullWidth size="large"
            />
            <EnhancedTextField
              label="Enter Password"
              placeholder="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => patch('confirmPassword', e.target.value)}
              fullWidth size="large"
              slotProps={{
                input: {
                  endAdornment: (
                    <Box
                      sx={{ color: 'text.disabled', display: 'flex', cursor: 'pointer' }}
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      <Icon name={showConfirm ? 'eye-slash' : 'eye'} size="sm" />
                    </Box>
                  ),
                },
              }}
            />
          </Stack>
        </SectionRow>

        {/* Role */}
        <SectionRow
          label="Role"
          description="This role will apply across all assigned tenants"
        >
          <EnhancedTextField
            label="Role"
            select
            fullWidth size="large"
            value={form.role}
            onChange={(e: ChangeEvent<HTMLInputElement>) => patch('role', e.target.value)}
          >
            {ROLE_OPTIONS.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </EnhancedTextField>
        </SectionRow>

        {/* Tenant Assignment */}
        <SectionRow
          label="Tenant Assignment"
          description="Configure communication channels and workload capacity"
        >
          <Autocomplete
            multiple
            options={TENANT_OPTIONS}
            value={form.tenants}
            onChange={(_: SyntheticEvent, val: string[]) => patch('tenants', val)}
            renderInput={(params: object) => (
              <EnhancedTextField
                {...params}
                label="Assign Tenant"
                placeholder="Search and select tenants"
                size="large"
                fullWidth
              />
            )}
          />
        </SectionRow>

        {/* Security Settings */}
        <SectionRow label="Security Settings" noDivider>
          <Stack spacing={2}>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.enforceMfa}
                    onChange={() => patch('enforceMfa', !form.enforceMfa)}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>
                      Enforce Multi-factor Authentication (MFA)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Require this user to setup MFA before accessing the platform
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: 0.5 } }}
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.sendInvitation}
                    onChange={() => patch('sendInvitation', !form.sendInvitation)}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4 }}>
                      Send Email Invitation
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Send an email invitation with setup instructions to the user
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: 0.5 } }}
              />
            </Box>
          </Stack>
        </SectionRow>
      </Box>

      {/* ── Sticky footer ────────────────────────────────────────────── */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={1.5}
        sx={(theme: Theme) => ({
          px: 3, py: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          flexShrink: 0,
        })}
      >
        <Button variant="outlined" color="neutral" size="medium" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" size="medium" onClick={handleSave}>
          Save
        </Button>
      </Stack>
    </Box>
  )
}
