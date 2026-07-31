import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login, authError, clearAuthError, isSdpAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isSdpAuthenticated) {
      navigate('/project/sdp-core', { replace: true })
    }
  }, [isSdpAuthenticated, navigate])

  if (isSdpAuthenticated) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)
    clearAuthError()
    try {
      await login(email.trim(), password)
      navigate('/project/sdp-core', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="text-2xl font-semibold text-gray-900 text-center">Le studio des parfums</span>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-100 border border-gray-200 rounded-xl p-6 space-y-4">
          <h1 className="text-lg font-semibold text-gray-900 text-center">Connexion</h1>
          {(error || authError) && (
            <p className="text-xs text-red-700 text-center bg-red-500/10 rounded-lg p-2">{error || authError}</p>
          )}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Email ou pseudo</label>
            <input
              type="text" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com ou pseudo"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Mot de passe</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 pr-10"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
