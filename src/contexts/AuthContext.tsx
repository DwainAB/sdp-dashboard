import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '../api/ocrClient'
import { authClient } from '../api/authClient'
import type { MarketplaceUser } from '../types/aglae'
import type { SdpUser } from '../types/auth'
import { canAccess } from '../types/auth'

interface AuthContextType {
  user: MarketplaceUser | null
  sdpUser: SdpUser | null
  isAuthenticated: boolean
  isSdpAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  loginWithGoogle: (accessToken: string) => Promise<void>
  login: (email: string, first_name?: string, last_name?: string) => Promise<void>
  logout: () => Promise<void>
  clearAuthError: () => void
  canAccess: (resource: string, action?: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

const STORAGE_KEY_SDP = 'sdp_user'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MarketplaceUser | null>(null)
  const [sdpUser, setSdpUser] = useState<SdpUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true'

    if (IS_DEV) {
      const devMarketplaceUser: MarketplaceUser = {
        id: 0,
        email: 'dev@aglae.local',
        name: 'Développeur',
        first_name: 'Développeur',
        last_name: '',
        role: {
          id: 0,
          name: 'Développeur',
          access_to_extraction: true,
          customers_access: true,
          customers_edit: true,
          customers_review_access: true,
          full_access: true,
          formula_edit: true,
          email_sending: true,
          devices_access: true,
        },
        team: null,
        is_online: true,
      }
      setUser(devMarketplaceUser)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(devMarketplaceUser))

      const devSdpUser: SdpUser = {
        id: 0,
        email: 'dev@sdp.local',
        first_name: 'Développeur',
        last_name: 'SDP',
        is_active: true,
        last_login: null,
        role_id: 1,
        role_name: 'admin',
        role_description: 'Accès complet à toutes les pages et actions',
        permissions: [
          { resource: 'dashboard', action: 'view' },
          { resource: 'dashboard', action: 'edit' },
          { resource: 'lylo', action: 'view' },
          { resource: 'lylo', action: 'edit' },
          { resource: 'aglae', action: 'view' },
          { resource: 'aglae', action: 'edit' },
          { resource: 'ninno', action: 'view' },
          { resource: 'ninno', action: 'edit' },
          { resource: 'users', action: 'view' },
          { resource: 'users', action: 'edit' },
        ],
      }
      setSdpUser(devSdpUser)
      localStorage.setItem(STORAGE_KEY_SDP, JSON.stringify(devSdpUser))
      return
    }

    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        setIsAuthenticated(true)
      } catch {}
    }

    const storedSdp = localStorage.getItem(STORAGE_KEY_SDP)
    if (storedSdp) {
      try {
        setSdpUser(JSON.parse(storedSdp))
      } catch {}
    }
  }, [])

  const getUserFromDatabase = async (email: string) => {
    try {
      return await authApi.getUserByEmail(email)
    } catch {
      return null
    }
  }

  const loginWithGoogle = async (accessToken: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const googleUser = await authApi.getGoogleUserInfo(accessToken)
      const dbUser = await getUserFromDatabase(googleUser.email)
      if (!dbUser) {
        setAuthError('Accès refusé. Votre email n\'est pas autorisé.')
        setIsLoading(false)
        return
      }
      await authApi.updateLoginStatus(dbUser.id, true)
      await authApi.recordLoginEvent(dbUser.id, 'connexion')
      const userData: MarketplaceUser = {
        id: dbUser.id,
        email: dbUser.email,
        name: googleUser.name,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name,
        role: dbUser.role,
        team: dbUser.team,
        is_online: true,
      }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))

      try {
        const sdpUserData = await authClient.login(googleUser.email, googleUser.given_name, googleUser.family_name)
        setSdpUser(sdpUserData)
        localStorage.setItem(STORAGE_KEY_SDP, JSON.stringify(sdpUserData))
      } catch {}
    } catch (err) {
      setAuthError('Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (email: string, first_name?: string, last_name?: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const sdpUserData = await authClient.login(email, first_name, last_name)
      setSdpUser(sdpUserData)
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEY_SDP, JSON.stringify(sdpUserData))
    } catch (err: any) {
      setAuthError(err.message || 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = async () => {
    if (user?.id) {
      try {
        await authApi.recordLoginEvent(user.id, 'deconnexion')
        await authApi.updateLoginStatus(user.id, false)
      } catch {}
    }
    setUser(null)
    setSdpUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem(STORAGE_KEY_SDP)
  }

  return (
    <AuthContext.Provider value={{
      user,
      sdpUser,
      isAuthenticated,
      isSdpAuthenticated: !!sdpUser,
      isLoading,
      authError,
      loginWithGoogle,
      login,
      logout,
      clearAuthError: () => setAuthError(null),
      canAccess: (resource: string, action = 'view') => canAccess(sdpUser, resource, action),
    }}>
      {children}
    </AuthContext.Provider>
  )
}
