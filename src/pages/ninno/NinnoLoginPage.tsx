import { useState } from 'react'
import { setToken, verifyToken } from '../../api/ninnoClient'

export default function NinnoLoginPage({ onLogin }: { onLogin: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const ok = await verifyToken(value)
      if (!ok) {
        setError('Jeton invalide.')
        return
      }
      setToken(value)
      onLogin()
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 border border-gray-200 rounded-xl p-8 w-[360px] shadow-lg flex flex-col gap-4"
      >
        <h1 className="text-xl font-bold text-gray-900">Ninno — Back office</h1>
        <p className="text-gray-500 text-sm m-0">Entrez le jeton administrateur pour continuer.</p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Jeton admin"
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 text-sm"
        />
        {error && <p className="text-red-700 text-sm m-0">{error}</p>}
        <button
          type="submit"
          disabled={loading || !value}
          className="w-full py-2.5 rounded-lg border-0 bg-indigo-600 text-white font-semibold text-sm transition-opacity disabled:opacity-60 hover:bg-indigo-500"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
