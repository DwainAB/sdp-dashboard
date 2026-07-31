import { useEffect, useState } from 'react'

type UpdateStatus =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'available'; version: string }
  | { phase: 'downloading'; percent: number }
  | { phase: 'downloaded'; version: string }
  | { phase: 'error' }

const TRANSIENT_MS = 8000

export function UpdateManager() {
  const [status, setStatus] = useState<UpdateStatus>({ phase: 'idle' })

  useEffect(() => {
    const api = window.electronAPI
    if (!api?.onUpdateEvent) return

    let resetTimer: ReturnType<typeof setTimeout> | undefined

    const resetAfterDelay = (next: UpdateStatus) => {
      setStatus(next)
      clearTimeout(resetTimer)
      resetTimer = setTimeout(() => setStatus({ phase: 'idle' }), TRANSIENT_MS)
    }

    const unsubscribe = api.onUpdateEvent(({ event, payload }) => {
      switch (event) {
        case 'checking-for-update':
          setStatus({ phase: 'checking' })
          break
        case 'update-available':
          setStatus({ phase: 'available', version: String(payload?.version ?? '') })
          break
        case 'update-not-available':
          resetAfterDelay({ phase: 'idle' })
          break
        case 'download-progress':
          setStatus({ phase: 'downloading', percent: Number(payload?.percent ?? 0) })
          break
        case 'update-downloaded':
          setStatus({ phase: 'downloaded', version: String(payload?.version ?? '') })
          break
        case 'error':
          resetAfterDelay({ phase: 'error' })
          break
      }
    })

    return () => {
      unsubscribe()
      clearTimeout(resetTimer)
    }
  }, [])

  if (status.phase === 'idle') return null

  return (
    <div className="fixed bottom-4 right-4 z-[110] flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
      {status.phase === 'checking' && <span className="text-sm text-gray-700">Vérification des mises à jour…</span>}

      {status.phase === 'available' && (
        <span className="text-sm text-gray-700">
          Mise à jour <span className="font-semibold">v{status.version}</span> disponible — téléchargement…
        </span>
      )}

      {status.phase === 'downloading' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Téléchargement de la mise à jour… {status.percent}%</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${status.percent}%` }} />
          </div>
        </div>
      )}

      {status.phase === 'downloaded' && (
        <>
          <span className="text-sm text-gray-700">
            Mise à jour <span className="font-semibold">v{status.version}</span> téléchargée
          </span>
          <button
            onClick={() => window.electronAPI?.quitAndInstall()}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Redémarrer maintenant
          </button>
        </>
      )}

      {status.phase === 'error' && (
        <span className="text-sm text-gray-500">Impossible de vérifier les mises à jour</span>
      )}
    </div>
  )
}
