import { useNavigate } from 'react-router-dom'
import { Box, Icon, IconButton, Stack, Typography } from '@exotel-npm-dev/signal-design-system'
import { useOnboarding } from '../context/OnboardingContext'

// ─── Exotel wordmark SVG ──────────────────────────────────────────────────────

export function ExotelLogoSvg() {
  return (
    <svg width="78" height="22" viewBox="0 0 78 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.28493 21.6882C3.27601 21.6882 0 18.5249 0 13.8775V13.819C0 9.49297 2.96642 6.00817 7.00377 6.00817C11.3254 6.00817 13.7801 9.63589 13.7801 13.6144C13.7801 14.2249 13.2999 14.6601 12.7628 14.6601H2.2019C2.5115 17.9111 4.74184 19.7396 7.3418 19.7396C9.14881 19.7396 10.4756 19.0153 11.5497 17.9988C11.7204 17.8526 11.9162 17.7389 12.1721 17.7389C12.7091 17.7389 13.1324 18.1741 13.1324 18.6971C13.1324 18.9569 13.0188 19.22 12.7945 19.4213C11.4108 20.7886 9.77119 21.6882 7.28493 21.6882ZM11.6066 13.007C11.3791 10.2789 9.85645 7.89835 6.94691 7.89835C4.40382 7.89835 2.48623 10.0776 2.2019 13.007H11.6066Z" fill="currentColor" fillOpacity="0.87"/>
      <path d="M30.277 13.9066V13.8482C30.277 9.60993 33.4961 6.00817 37.9031 6.00817C42.2817 6.00817 45.5009 9.55145 45.5009 13.7897V13.8482C45.5009 18.0865 42.2532 21.6882 37.8463 21.6882C33.4677 21.6882 30.277 18.145 30.277 13.9066ZM43.2673 13.9066V13.8482C43.2673 10.6264 40.9233 7.98279 37.8463 7.98279C34.684 7.98279 32.5074 10.6232 32.5074 13.7897V13.8482C32.5074 17.0699 34.823 19.6844 37.9 19.6844C41.0654 19.6844 43.2673 17.0732 43.2673 13.9066Z" fill="currentColor" fillOpacity="0.87"/>
      <path d="M47.3648 17.3624V8.30449H46.1769C45.6683 8.30449 45.2166 7.84006 45.2166 7.3172C45.2166 6.76509 45.6683 6.32989 46.1769 6.32989H47.3648V2.78661C47.3648 2.17604 47.8165 1.65316 48.4389 1.65316C49.0328 1.65316 49.5414 2.17604 49.5414 2.78661V6.32989H53.326C53.863 6.32989 54.3148 6.79431 54.3148 7.3172C54.3148 7.8693 53.863 8.30449 53.326 8.30449H49.5414V17.0734C49.5414 18.9019 50.5302 19.5709 51.9992 19.5709C52.7605 19.5709 53.1554 19.3663 53.326 19.3663C53.8346 19.3663 54.258 19.8015 54.258 20.3244C54.258 20.7303 54.0052 21.0518 53.6356 21.1948C53.0133 21.4546 52.3372 21.6007 51.4906 21.6007C49.1434 21.6007 47.3648 20.412 47.3648 17.3624Z" fill="currentColor" fillOpacity="0.87"/>
      <path d="M62.2758 21.6882C58.2637 21.6882 54.9877 18.5249 54.9877 13.8775V13.819C54.9877 9.49297 57.9541 6.00817 61.9914 6.00817C66.3131 6.00817 68.7678 9.63589 68.7678 13.6144C68.7678 14.2249 68.2876 14.6601 67.7505 14.6601H57.1896C57.4992 17.9111 59.7295 19.7396 62.3295 19.7396C64.1365 19.7396 65.4633 19.0153 66.5374 17.9988C66.708 17.8526 66.9038 17.7389 67.1598 17.7389C67.6968 17.7389 68.1201 18.1741 68.1201 18.6971C68.1201 18.9569 68.0064 19.22 67.7821 19.4213C66.4016 20.7886 64.762 21.6882 62.2758 21.6882ZM66.5974 13.007C66.3732 10.2789 64.8473 7.89835 61.9377 7.89835C59.3947 7.89835 57.4739 10.0776 57.1927 13.007H66.5974Z" fill="currentColor" fillOpacity="0.87"/>
      <path d="M71.1181 1.13346C71.1181 0.522884 71.5982 0 72.1922 0C72.8145 0 73.2948 0.522884 73.2948 1.13346V20.3535C73.2948 20.9933 72.8429 21.487 72.2206 21.487C71.5982 21.487 71.1181 20.9933 71.1181 20.3535V1.13346Z" fill="currentColor" fillOpacity="0.87"/>
      <path d="M27.7938 21.6721C26.8082 21.6786 25.9837 20.9738 25.7814 19.9768C25.5793 18.9797 25.1938 18.0704 24.5273 17.3039C23.1878 15.7612 20.8754 15.7677 19.5422 17.3201C18.9009 18.0704 18.5092 18.9505 18.3165 19.9216C18.1174 20.9154 17.334 21.6526 16.3957 21.6819C15.3595 21.7143 14.5161 21.0745 14.2854 20.0482C14.0169 18.8595 14.7783 17.7196 15.9755 17.476C17.0718 17.2519 18.0637 16.7712 18.8061 15.8813C19.9181 14.5465 19.7475 12.5849 18.4491 11.445C17.7099 10.7954 16.8506 10.4024 15.9092 10.2043C14.9046 9.99326 14.2222 9.12932 14.2349 8.05111C14.2475 7.06379 14.9899 6.20314 15.9629 6.044C17.0781 5.86213 18.0795 6.6156 18.3165 7.77507C18.5376 8.85978 18.9767 9.84384 19.7728 10.6201C21.0618 11.8737 23.0488 11.8574 24.3409 10.6005C24.4546 10.4901 24.5999 10.3862 24.7484 10.3407C25.0738 10.2368 25.4118 10.396 25.5761 10.6883C25.7499 10.9968 25.7057 11.3638 25.4466 11.6301C25.058 12.0296 24.7769 12.4972 24.6474 13.0461C24.3346 14.4004 24.739 15.5144 25.7814 16.3815C26.4954 16.9759 27.3262 17.3169 28.2203 17.515C29.2059 17.7326 29.8947 18.6322 29.8504 19.6553C29.8062 20.7042 29.0575 21.5454 28.0465 21.6786C27.9644 21.6819 27.8791 21.6721 27.7938 21.6721Z" fill="currentColor" fillOpacity="0.87"/>
      <path d="M29.841 8.12268C29.841 9.30484 28.9375 10.2272 27.7813 10.2272C26.6471 10.2272 25.7499 9.28861 25.7531 8.10966C25.7531 6.95024 26.6598 6.02464 27.797 6.02138C28.9343 6.01489 29.841 6.95023 29.841 8.12268Z" fill="currentColor" fillOpacity="0.87"/>
    </svg>
  )
}

// ─── Shared top bar ───────────────────────────────────────────────────────────

export function TopBar({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate()
  const { firstName } = useOnboarding()
  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'OP'

  return (
    <Box
      component="header"
      sx={{
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        px: 2, gap: 1.5, height: 56, minHeight: 56, flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: '1px solid', borderColor: 'divider', zIndex: 1100,
      }}
    >
      {/* Left side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, minWidth: 0 }}>
        <IconButton aria-label="App launcher" sx={{ width: 40, height: 40, borderRadius: '100px', color: 'text.primary', flexShrink: 0 }}>
          <Icon name="squares-four" size="sm" />
        </IconButton>

        <Box
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'text.primary', cursor: 'pointer' }}
        >
          <ExotelLogoSvg />
        </Box>

        {/* Credits — pushed right */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <Stack
            direction="row" alignItems="center" spacing={0.5}
            sx={{ px: 1.5, py: '5px', bgcolor: '#F0FDF4', border: '1px solid #9AD7AF', borderRadius: 1, userSelect: 'none' }}
          >
            <Box sx={{ display: 'flex', color: '#016630', flexShrink: 0 }}>
              <Icon name="wallet" size="sm" />
            </Box>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: '#008236', letterSpacing: '-0.15px', lineHeight: '20px' }}>
              Credits:
            </Typography>
            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: '#016630', letterSpacing: '-0.15px', lineHeight: '20px' }}>
              ₹12,453
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Avatar */}
      <Box
        sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0, cursor: 'pointer' }}
        onClick={onLogout} title="Click to log out" role="button" aria-label="User menu"
      >
        <Box sx={{ width: 32, height: 32, bgcolor: '#5C6BC0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: '#ffffff', fontSize: 14, fontWeight: 500, fontFamily: "'Noto Sans','Inter',sans-serif", letterSpacing: '0.14px', lineHeight: '20px', userSelect: 'none' }}>
            {initial}
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', width: 8, height: 8, bgcolor: '#2E7D32', borderRadius: '100px', bottom: -2, right: -2, border: '2px solid', borderColor: 'background.paper' }} />
      </Box>
    </Box>
  )
}
