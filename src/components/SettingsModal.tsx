import { useState } from 'react'
import { X, Sun, Moon, Mail, Lock } from 'lucide-react'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const sections = [
  { id: 'appearance', name: 'Apparence', icon: Sun },
  { id: 'account', name: 'Compte', icon: Mail },
] as const

const isDark = () => document.documentElement.dataset.theme !== 'light'

function setTheme(dark: boolean) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [active, setActive] = useState('appearance')
  const [dark, setDark] = useState(isDark)
  const [email, setEmail] = useState('thomas@entreprise.com')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (!open) return null

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    setTheme(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Paramètres</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex" style={{ minHeight: 320 }}>
          <div className="w-44 border-r border-gray-800 p-3 space-y-1 shrink-0">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={16} />
                  {s.name}
                </button>
              )
            })}
          </div>

          <div className="flex-1 p-6">
            {active === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Apparence</h3>
                  <p className="text-xs text-gray-500">Personnalisez l'affichage de l'application</p>
                </div>

                <div className="flex items-center justify-between bg-gray-950 rounded-xl border border-gray-800 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {dark ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-400" />}
                    <div>
                      <p className="text-sm text-white">Mode {dark ? 'sombre' : 'clair'}</p>
                      <p className="text-[11px] text-gray-500">Basculer entre les thèmes</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleDark}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      dark ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        dark ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {active === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Compte</h3>
                  <p className="text-xs text-gray-500">Modifiez vos identifiants de connexion</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Adresse email</label>
                    <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
                      <Mail size={15} className="text-gray-600 shrink-0" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Nouveau mot de passe</label>
                    <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
                      <Lock size={15} className="text-gray-600 shrink-0" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Confirmer le mot de passe</label>
                    <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
                      <Lock size={15} className="text-gray-600 shrink-0" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
