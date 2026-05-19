import { Outlet, useNavigate } from 'react-router-dom'
import { Box } from '@exotel-npm-dev/signal-design-system'
import { clearPlaygroundSession } from '../auth/playgroundSession'
import { TopBar } from './TopBar'

// Dot-grid PNG tile (120×120) from the design background spec, tiled at 72×72px at 2% opacity
const BG_TILE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAADIklEQVR4AezdQW7DIBCF4TbbHCT3P04PknUrWLkjDEZMq8fzX8lRjDGZeV9ZeOXHx+Dv+Xx9H4/B9O0vH3st33dvaAi8e4N3rx9g8/8AgAE2T8C8PXYwwOYJmLfHDnYHLs96vSP235tbrsX5auelxufz9evZ/jgW6z1ea32P89XO2cFqIsn1AJwcqNpyAKuJJNfzeL+/PntH/L3e3HItzlc7LzX2jlhvb265FuernbOD1USS6wE4OVC15QBWE0muB+DkQNWWC8Bq5VHPagIAryYofj/A4kCr5Q2By7Pe8Vj9QfX7j72W7+r1juobAo8W4Lp2AgBr+yxXB/ByhNoLAKzts1wdwDVC3w+AfW1rZwDXGHw/APa1rZ0BXGPw/QDY17Z2BnCNwfcDYF/b2hnANQbfjz6wb9+36Qxgc2qAATZPwLw9djDA5gmYt8cOBtg8AfP22MEtYKMxgI0wW60A3ErFaAxgI8xWKwC3UjEaA9gIs9UKwK1UjMYANsJstQJwKxWjsSlgo75v0wrA5tQAA2yegHl77GCAzRMwb48dDLB5AubtsYMvAO88ZQgc31Owc7NXanfrdwh8JRTm6CYAsK5NSmUAp8SouwjAujYplQGcEqPuIgDr2qRUBnBKjLqLPOJzXzyPpR+uN9//F+ernc/WPztfrV92sJpIcj0AJweqthzAaiLJ9fDuwvDuwvDuxphveW9D74jz1c7ZwWoiyfUAnByo2nIAq4kk1wPwfKBb3QHwVlzzxQI8n9lWdwC8Fdd8sUPg+Aw4/xN73eHW7xB4Lx6qjQkAHBMxOwfYDDS2A3BMxOw8EdgsGZN2ADaBPGsD4LNkTMYBNoE8awPgs2RMxgE2gTxrA+CzZEzGATaBPGsD4LNkLo9rTwRY22e5OoCXI9ReAGBtn+XqAF6OUHsBgLV9lqsDeDlC7QUA1vZZrg7g5Qi1F/g7YO2+b1MdwObUAANsnoB5e+xggM0TMG+PHQyweQLm7bGDs4HF1gNYDCS7HICzExVbD2AxkOxyAM5OVGw9gMVAsssBODtRsfUAFgPJLgfg7ETF1vs3YLG+b1PODwAAAP//JEZrFQAAAAZJREFUAwAHK0EA9s+EkgAAAABJRU5ErkJggg=='

export function HomeLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearPlaygroundSession()
    navigate('/sign-in', { replace: true })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#FFFFFC',
        position: 'relative',
        // Fixed dot-grid pattern overlay at 2% opacity — matches the design spec SVG
        '&::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("${BG_TILE}")`,
          backgroundSize: '72px 72px',
          backgroundRepeat: 'repeat',
          opacity: 0.02,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <TopBar onLogout={handleLogout} />
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
