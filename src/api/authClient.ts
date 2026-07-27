import type { SdpUser } from '../types/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const authClient = {
  async login(email: string, first_name?: string, last_name?: string): Promise<SdpUser> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_name, last_name }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Erreur de connexion')
    }
    return res.json()
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
