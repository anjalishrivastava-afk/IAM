import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { RolesPrivilegesCopilotDrawer } from '../components/rbac/RolesPrivilegesCopilotDrawer'

/** Routes that host the RBAC Chat-with-AI entry points; drawer closes outside this subtree. */
const CHAT_AI_ROUTE_PREFIX = '/closed-interaction/user-management'

type AiChatAssistLayoutValue = {
  open: boolean
  openChat: () => void
  closeChat: () => void
}

const AiChatAssistLayoutContext = createContext<AiChatAssistLayoutValue | null>(null)

export function AiChatAssistProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!location.pathname.startsWith(CHAT_AI_ROUTE_PREFIX)) {
      setOpen(false)
    }
  }, [location.pathname])

  const openChat = useCallback(() => setOpen(true), [])
  const closeChat = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({ open, openChat, closeChat }),
    [open, openChat, closeChat],
  )

  return (
    <AiChatAssistLayoutContext.Provider value={value}>{children}</AiChatAssistLayoutContext.Provider>
  )
}

/** @throws outside {@link AiChatAssistProvider} */
export function useAiChatAssistLayout(): AiChatAssistLayoutValue {
  const ctx = useContext(AiChatAssistLayoutContext)
  if (!ctx) {
    throw new Error('useAiChatAssistLayout must be used inside AiChatAssistProvider')
  }
  return ctx
}

/** Renders in AppLayout below ExoAppBar, outside the padded main column. */
export function AiChatAssistLayoutDock() {
  const { open, closeChat } = useAiChatAssistLayout()
  return <RolesPrivilegesCopilotDrawer open={open} onClose={closeChat} />
}
