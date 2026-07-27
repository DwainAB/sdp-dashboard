const API_URL = import.meta.env.VITE_NINNO_API_URL ?? 'https://backend-ninno-production.up.railway.app'
const TOKEN_KEY = 'ninno_admin_token'

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.error ?? message
    } catch {
      // pas de corps JSON
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return null
  return res.json()
}

export interface AppConfig {
  backgroundImageUrl: string
  backgroundOtherImageUrl: string
  logoImageUrl: string
}

export interface Note {
  id: number
  name: string
  type: 'top' | 'heart' | 'base'
  imageUrl: string | null
  happyImageUrl: string | null
  sadImageUrl: string | null
  happyAnimUrl: string | null
  sadAnimUrl: string | null
}

export async function verifyToken(token: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/admin/config`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.ok
}

export function getConfig(): Promise<AppConfig> {
  return request('/admin/config')
}

export function uploadBackground(file: File): Promise<AppConfig> {
  const form = new FormData()
  form.append('image', file)
  return request('/admin/config/background', { method: 'POST', body: form })
}

export function uploadBackgroundOther(file: File): Promise<AppConfig> {
  const form = new FormData()
  form.append('image', file)
  return request('/admin/config/background/other', { method: 'POST', body: form })
}

export function uploadLogo(file: File): Promise<AppConfig> {
  const form = new FormData()
  form.append('image', file)
  return request('/admin/config/logo', { method: 'POST', body: form })
}

export function getNotes(): Promise<Note[]> {
  return request('/admin/notes')
}

export interface NoteInput {
  name: string
  type: 'top' | 'heart' | 'base'
  image?: File | null
  happyImage?: File | null
  sadImage?: File | null
  happyAnim?: File | null
  sadAnim?: File | null
}

function buildNoteForm(input: NoteInput) {
  const form = new FormData()
  form.append('name', input.name)
  form.append('type', input.type)
  if (input.image) form.append('image', input.image)
  if (input.happyImage) form.append('happyImage', input.happyImage)
  if (input.sadImage) form.append('sadImage', input.sadImage)
  if (input.happyAnim) form.append('happyAnim', input.happyAnim)
  if (input.sadAnim) form.append('sadAnim', input.sadAnim)
  return form
}

export function createNote(input: NoteInput): Promise<Note> {
  return request('/admin/notes', { method: 'POST', body: buildNoteForm(input) })
}

export function updateNote(id: number, input: NoteInput): Promise<Note> {
  return request(`/admin/notes/${id}`, { method: 'PUT', body: buildNoteForm(input) })
}

export function deleteNote(id: number): Promise<null> {
  return request(`/admin/notes/${id}`, { method: 'DELETE' })
}
