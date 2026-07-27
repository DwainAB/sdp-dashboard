export interface Permission {
  resource: string
  action: string
}

export interface Role {
  id: number
  name: string
  description: string
  permissions: Permission[]
  created_at?: string
}

export interface SdpUser {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  last_login: string | null
  created_at?: string
  role_id: number
  role_name: string
  role_description?: string
  permissions: Permission[]
}

export function canAccess(user: SdpUser | null, resource: string, action: string = 'view'): boolean {
  if (!user) return false
  return user.permissions.some(p => p.resource === resource && p.action === action)
}
