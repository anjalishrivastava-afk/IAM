import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type OnboardingRole = 'admin' | 'supervisor' | 'agent' | 'developer' | null
export type OnboardingNeed =
  | 'contact_center'
  | 'engage'
  | 'chatbot'
  | 'voicebot'
  | 'quality'
  | 'ai_assist'
  | null

export type DevStartMode = 'code' | 'nocode' | null
export type DevEnvironment = 'sandbox' | 'production' | null

interface OnboardingState {
  firstName: string
  role: OnboardingRole
  primaryNeed: OnboardingNeed
  useCases: string[]
  teamSize: string | null
  industry: string | null
  // Developer-specific fields
  devApi: string | null
  devLanguage: string | null
  devStartMode: DevStartMode
  devWebhook: string
  devEnvironment: DevEnvironment
  devTestPhone: string
}

interface OnboardingContextValue extends OnboardingState {
  setFirstName: (name: string) => void
  setRole: (role: OnboardingRole) => void
  setPrimaryNeed: (need: OnboardingNeed) => void
  setUseCases: (cases: string[]) => void
  setTeamSize: (size: string | null) => void
  setIndustry: (industry: string | null) => void
  setDevApi: (api: string | null) => void
  setDevLanguage: (lang: string | null) => void
  setDevStartMode: (mode: DevStartMode) => void
  setDevWebhook: (url: string) => void
  setDevEnvironment: (env: DevEnvironment) => void
  setDevTestPhone: (phone: string) => void
  resetOnboarding: (firstName?: string) => void
}

const STORAGE_KEY = 'exotel-onboarding'

const defaultState: OnboardingState = {
  firstName: '',
  role: null,
  primaryNeed: null,
  useCases: [],
  teamSize: null,
  industry: null,
  devApi: null,
  devLanguage: null,
  devStartMode: null,
  devWebhook: '',
  devEnvironment: null,
  devTestPhone: '',
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return defaultState
      // Merge with defaultState so new fields are never undefined when loaded
      // from an older stored version that pre-dates developer fields.
      return { ...defaultState, ...(JSON.parse(stored) as Partial<OnboardingState>) }
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const resetOnboarding = (firstName?: string) => {
    setState({ ...defaultState, firstName: firstName ?? '' })
  }

  const setFirstName = (firstName: string) => setState((s) => ({ ...s, firstName }))
  const setRole = (role: OnboardingRole) => setState((s) => ({ ...s, role }))
  const setPrimaryNeed = (primaryNeed: OnboardingNeed) => setState((s) => ({ ...s, primaryNeed }))
  const setUseCases = (useCases: string[]) => setState((s) => ({ ...s, useCases }))
  const setTeamSize = (teamSize: string | null) => setState((s) => ({ ...s, teamSize }))
  const setIndustry = (industry: string | null) => setState((s) => ({ ...s, industry }))
  const setDevApi = (devApi: string | null) => setState((s) => ({ ...s, devApi }))
  const setDevLanguage = (devLanguage: string | null) => setState((s) => ({ ...s, devLanguage }))
  const setDevStartMode = (devStartMode: DevStartMode) => setState((s) => ({ ...s, devStartMode }))
  const setDevWebhook = (devWebhook: string) => setState((s) => ({ ...s, devWebhook }))
  const setDevEnvironment = (devEnvironment: DevEnvironment) => setState((s) => ({ ...s, devEnvironment }))
  const setDevTestPhone = (devTestPhone: string) => setState((s) => ({ ...s, devTestPhone }))

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        resetOnboarding, setFirstName, setRole, setPrimaryNeed, setUseCases, setTeamSize, setIndustry,
        setDevApi, setDevLanguage, setDevStartMode, setDevWebhook, setDevEnvironment, setDevTestPhone,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
