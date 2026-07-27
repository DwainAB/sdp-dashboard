import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import { DashboardView } from './pages/DashboardView'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function App() {
  const content = (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/project/sdp-core" replace />} />
        <Route path="/project/:slug" element={<DashboardView />} />
      </Routes>
    </BrowserRouter>
  )

  if (!GOOGLE_CLIENT_ID) {
    return (
      <AuthProvider>
        <ToastProvider>
          {content}
        </ToastProvider>
      </AuthProvider>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastProvider>
          {content}
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
