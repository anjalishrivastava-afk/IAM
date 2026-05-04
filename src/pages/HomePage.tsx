import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@exotel-npm-dev/signal-design-system'
import cursorLogo from '../assets/cursor-logo.png'
import figmaLogo from '../assets/figma-logo.png'
import storybookLogo from '../assets/storybook-logo.png'

function AssetIcon({ src, alt, size = 24, ...styleProps }: { src: string; alt: string; size?: number; styleProps?: CSSProperties }) {
  return (
    <Box sx={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...styleProps }}>
      <img src={src} alt={alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </Box>
  )
}

function CodeConnectIcon2() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <AssetIcon src={cursorLogo} alt="Code Connect" size={36} />
      <AssetIcon src={figmaLogo} alt="Code Connect" size={24} styleProps={{ marginLeft: -8 }} />
    </Box>
  )
}

type LinkCardProps = {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}

function LinkCard({ icon, title, description, onClick }: LinkCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      elevation={0}
      sx={{
        height: '100%',
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'action.hover',
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Stack spacing={1.25}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {icon}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Card>
  )
}

export function HomePage() {
  const handleLinkClick = (link: string) => {
    window.open(link, '_blank')
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        p: 3,
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'surface.elevation1',
      }}
    >
      <Stack spacing={1.5} sx={{ maxWidth: 770 }}>
        <Typography component="h5" variant="h5">
          👋 Welcome to Design Playground
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          You&apos;re all set! You can start prototyping now using components from Signal Design System.
          Feel free to remove everything on this page and start fresh. Below are some helpful links to get
          you started. Have fun!
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkCard
              icon={<AssetIcon src={storybookLogo} alt="Storybook" />}
              onClick={() => handleLinkClick('https://69ba4becb6eabba83cbd8bc1-elutanrgjd.chromatic.com')}
              title="Storybook"
              description="Browse all available Signal components in our design system."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkCard
              icon={<AssetIcon src={figmaLogo} alt="Figma" />}
              onClick={() => handleLinkClick('https://www.figma.com/files/team/1507259607158446946/project/350508561?fuid=1507259601935010169')}
              title="Figma Library"
              description="View all Signal components in Figma before building in code."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkCard
              icon={<AssetIcon src={cursorLogo} alt="Cursor" size={36} />}
              onClick={() => handleLinkClick('https://cursor.com/get-started')}
              title="Get Started with Cursor"
              description="Get Started with Cursor"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LinkCard
              icon={<CodeConnectIcon2 />}
              onClick={() => handleLinkClick('https://developers.figma.com/docs/code-connect/quickstart-guide/')}
              title="Code Connect and MCP Guides"
              description="Learn how to use Figma links with Cursor for faster prototyping."
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  )
}
