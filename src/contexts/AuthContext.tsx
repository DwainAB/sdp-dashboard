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
  mustChangePassword: boolean
  loginWithGoogle: (accessToken: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  setNewSdpUser: (user: SdpUser) => void
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
  const [mustChangePassword, setMustChangePassword] = useState(false)

  useEffect(() => {
    const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true'

    if (IS_DEV) {
      const devUser: MarketplaceUser = {
        id: 0, email: 'dev@aglae.local', name: 'Développeur',
        first_name: 'Développeur', last_name: '',
        role: { id: 0, name: 'Développeur', access_to_extraction: true, customers_access: true, customers_edit: true, customers_review_access: true, full_access: true, formula_edit: true, email_sending: true, devices_access: true },
        team: null, is_online: true,
      }
      setUser(devUser)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(devUser))

      const devSdp: SdpUser = {
        id: 0, email: 'dev@sdp.local', pseudo: 'sdev100', first_name: 'Développeur', last_name: 'SDP',
        is_active: true, last_login: null, role_id: 1, role_name: 'admin',
        role_description: 'Accès complet', permissions: [
          { resource: 'dashboard', action: 'view' }, { resource: 'dashboard', action: 'edit' },
          { resource: 'lylo', action: 'view' }, { resource: 'lylo', action: 'edit' },
          { resource: 'aglae', action: 'view' }, { resource: 'aglae', action: 'edit' },
          { resource: 'ninno', action: 'view' }, { resource: 'ninno', action: 'edit' },
          { resource: 'users', action: 'view' }, { resource: 'users', action: 'edit' },
        ],
      }
      setSdpUser(devSdp)
      localStorage.setItem(STORAGE_KEY_SDP, JSON.stringify(devSdp))
      return
    }

    const storedSdp = localStorage.getItem(STORAGE_KEY_SDP)
    if (storedSdp) {
      try {
        const parsed = JSON.parse(storedSdp)
        setSdpUser(parsed)
        setIsAuthenticated(true)
      } catch {}
    }
  }, [])

  const loginWithGoogle = async (accessToken: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const googleUser = await authApi.getGoogleUserInfo(accessToken)
      const dbUser = await authApi.getUserByEmail(googleUser.email)
      if (!dbUser) {
        setAuthError('Accès refusé. Votre email n\'est pas autorisé.')
        setIsLoading(false)
        return
      }
      await authApi.updateLoginStatus(dbUser.id, true)
      await authApi.recordLoginEvent(dbUser.id, 'connexion')
      const userData: MarketplaceUser = {
        id: dbUser.id, email: dbUser.email, name: googleUser.name,
        first_name: dbUser.first_name, last_name: dbUser.last_name,
        role: dbUser.role, team: dbUser.team, is_online: true,
      }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch {
      setAuthError('Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const data = await authClient.login(email, password)
      const sdpUserData: SdpUser = {
        id: data.id, email: data.email, pseudo: data.pseudo,
        first_name: data.first_name, last_name: data.last_name,
        is_active: data.is_active, last_login: data.last_login,
        role_id: data.role_id, role_name: data.role_name, role_description: data.role_description,
        permissions: data.permissions,
      }
      setSdpUser(sdpUserData)
      setMustChangePassword(data.must_change_password)
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEY_SDP, JSON.stringify(sdpUserData))
    } catch (err: any) {
      setAuthError(err.message || 'Erreur de connexion')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setNewSdpUser = useCallback((user: SdpUser) => {
    setSdpUser(user)
    setMustChangePassword(false)
    localStorage.setItem(STORAGE_KEY_SDP, JSON.stringify(user))
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
    setMustChangePassword(false)
    localStorage.removeItem('user')
    localStorage.removeItem(STORAGE_KEY_SDP)
  }

  return (
    <AuthContext.Provider value={{
      user, sdpUser, isAuthenticated, isSdpAuthenticated: !!sdpUser,
      isLoading, authError, mustChangePassword,
      loginWithGoogle, login, setNewSdpUser, logout,
      clearAuthError: () => setAuthError(null),
      canAccess: (resource: string, action = 'view') => canAccess(sdpUser, resource, action),
    }}>
      {children}
    </AuthContext.Provider>
  )
}
