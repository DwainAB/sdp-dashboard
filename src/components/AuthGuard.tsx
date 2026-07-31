import { useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ChangePasswordPage from '../pages/ChangePasswordPage'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isSdpAuthenticated, mustChangePassword, sdpUser, isLoading, setNewSdpUser } = useAuth()
  const [changed, setChanged] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Chargement…</p>
        </div>
      </div>
    )
  }

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
