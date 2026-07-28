import type { SdpUser } from '../types/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface LoginResponse extends SdpUser {
  must_change_password: boolean
}

export const authClient = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur de connexion' }))
      throw new Error(err.error || 'Email ou mot de passe incorrect')
    }
    return res.json()
  },

  async changePassword(email: string, current_password: string, new_password: string): Promise<void> {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, current_password, new_password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur' }))
      throw new Error(err.error || 'Erreur lors du changement de mot de passe')
    }
  },

  async getMe(email: string): Promise<SdpUser> {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { 'x-user-email': email },
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Utilisateur non trouvé')
    }
    return res.json()
  },

  async getUsers(): Promise<SdpUser[]> {
    const res = await fetch(`${API_URL}/users`)
    return res.json()
  },
}
