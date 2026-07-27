import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api/ocrClient'
import type { MarketplaceUser } from '../types/aglae'

interface AuthContextType {
  user: MarketplaceUser | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  loginWithGoogle: (accessToken: string) => Promise<void>
  logout: () => Promise<void>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MarketplaceUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true'

    if (IS_DEV) {
      const devUser: MarketplaceUser = {
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
      setUser(devUser)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(devUser))
      return
    }

    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
        setIsAuthenticated(true)
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
    } catch (err) {
      setAuthError('Erreur lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    if (user?.id) {
      try {
        await authApi.recordLoginEvent(user.id, 'deconnexion')
        await authApi.updateLoginStatus(user.id, false)
      } catch {}
    }
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, authError, loginWithGoogle, logout, clearAuthError: () => setAuthError(null) }}>
      {children}
    </AuthContext.Provider>
  )
}
