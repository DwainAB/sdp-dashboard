import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Eye, EyeOff, Save } from 'lucide-react'
import { authClient } from '../api/authClient'

interface Props {
  email: string
  onSuccess: () => void
}

export default function ChangePasswordPage({ email, onSuccess }: Props) {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show, setShow] = useState({ cur: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authClient.changePassword(email, currentPassword, newPassword)
      onSuccess()
      navigate('/project/sdp-core', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BarChart3 size={28} className="text-indigo-400" />
          <span className="text-xl font-bold text-white">SDP Dashboard</span>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white">Changement de mot de passe</h1>
            <p className="text-xs text-gray-500 mt-1">Vous devez changer votre mot de passe provisoire</p>
          </div>
          {error && <p className="text-xs text-red-400 text-center bg-red-400/10 rounded-lg p-2">{error}</p>}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mot de passe actuel</label>
            <div className="relative">
              <input type={show.cur ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white pr-10 focus:outline-none focus:border-indigo-500"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, cur: !s.cur }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show.cur ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nouveau mot de passe</label>
            <div className="relative">
              <input type={show.new ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white pr-10 focus:outline-none focus:border-indigo-500"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Confirmer le mot de passe</label>
            <div className="relative">
              <input type={show.confirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white pr-10 focus:outline-none focus:border-indigo-500"
              />
              <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} /> {loading ? 'Enregistrement...' : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}
