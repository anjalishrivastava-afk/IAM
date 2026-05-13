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

interface OnboardingState {
  firstName: string
  role: OnboardingRole
  primaryNeed: OnboardingNeed
  useCases: string[]
  teamSize: string | null
  industry: string | null
}

interface OnboardingContextValue extends OnboardingState {
  setFirstName: (name: string) => void
  setRole: (role: OnboardingRole) => void
  setPrimaryNeed: (need: OnboardingNeed) => void
  setUseCases: (cases: string[]) => void
  setTeamSize: (size: string | null) => void
  setIndustry: (industry: string | null) => void
}

const STORAGE_KEY = 'exotel-onboarding'

const defaultState: OnboardingState = {
  firstName: '',
  role: null,
  primaryNeed: null,
  useCases: [],
  teamSize: null,
  industry: null,
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? (JSON.parse(stored) as OnboardingState) : defaultState
    } catch {
      return defaultState
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setFirstName = (firstName: string) => setState((s) => ({ ...s, firstName }))
  const setRole = (role: OnboardingRole) => setState((s) => ({ ...s, role }))
  const setPrimaryNeed = (primaryNeed: OnboardingNeed) => setState((s) => ({ ...s, primaryNeed }))
  const setUseCases = (useCases: string[]) => setState((s) => ({ ...s, useCases }))
  const setTeamSize = (teamSize: string | null) => setState((s) => ({ ...s, teamSize }))
  const setIndustry = (industry: string | null) => setState((s) => ({ ...s, industry }))

  return (
    <OnboardingContext.Provider
      value={{ ...state, setFirstName, setRole, setPrimaryNeed, setUseCases, setTeamSize, setIndustry }}
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
