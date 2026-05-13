import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ExotelThemeProvider } from '@exotel-npm-dev/signal-design-system'
import './index.css'
import App from './App.tsx'
import { OnboardingProvider } from './context/OnboardingContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExotelThemeProvider defaultFont="ibm-plex-sans">
      <BrowserRouter>
        <OnboardingProvider>
          <App />
        </OnboardingProvider>
      </BrowserRouter>
    </ExotelThemeProvider>
  </StrictMode>,
)
