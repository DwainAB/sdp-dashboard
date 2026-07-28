import { useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ChangePasswordPage from '../pages/ChangePasswordPage'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isSdpAuthenticated, mustChangePassword, sdpUser, isLoading, setNewSdpUser } = useAuth()
  const [changed, setChanged] = useState(false)

  if (isLoading) return null

  if (!isSdpAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (mustChangePassword && sdpUser && !changed) {
    return (
      <ChangePasswordPage
        email={sdpUser.email}
        onSuccess={() => {
          setChanged(true)
          setNewSdpUser({ ...sdpUser })
        }}
      />
    )
  }

  return <>{children}</>
}
