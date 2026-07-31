import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
  id: number
  type: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  action?: string
}

interface ToastContextType {
  addToast: (toast: { type?: Toast['type']; title?: string; message?: string; action?: string; duration?: number }) => number
  removeToast: (id: number) => void
  showError: (title: string, message?: string, action?: string) => number
  showSuccess: (title: string, message?: string) => number
  showWarning: (title: string, message?: string, action?: string) => number
  showInfo: (title: string, message?: string) => number
  showQuotaError: (detail?: { type?: string; message?: string }) => number
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback(({ type = 'info', title, message, action, duration = 5000 }: { type?: Toast['type']; title?: string; message?: string; action?: string; duration?: number }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message, action }])
    if (duration > 0) setTimeout(() => removeToast(id), duration)
    return id
  }, [removeToast])

  const showError = useCallback((title: string, message?: string, action?: string) => addToast({ type: 'error', title, message, action, duration: 8000 }), [addToast])
  const showSuccess = useCallback((title: string, message?: string) => addToast({ type: 'success', title, message, duration: 4000 }), [addToast])
  const showWarning = useCallback((title: string, message?: string, action?: string) => addToast({ type: 'warning', title, message, action, duration: 6000 }), [addToast])
  const showInfo = useCallback((title: string, message?: string) => addToast({ type: 'info', title, message, duration: 5000 }), [addToast])
  const showQuotaError = useCallback((detail?: { type?: string; message?: string }) => {
    const messages: Record<string, string> = { csv: "Vous avez atteint votre limite de téléchargements CSV pour ce mois.", pdf: "Vous avez atteint votre limite d'extractions PDF pour ce mois." }
    return addToast({ type: 'error', title: 'Quota dépassé', message: messages[detail?.type || ''] || detail?.message || 'Quota mensuel dépassé', action: 'Contactez votre administrateur pour augmenter votre quota.', duration: 10000 })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showError, showSuccess, showWarning, showInfo, showQuotaError }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
          {toasts.map(t => (
            <div key={t.id} className={`rounded-lg border px-4 py-3 shadow-lg text-sm flex items-start gap-3 ${
              t.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' :
              t.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' :
              t.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' :
              'bg-white border-gray-300 text-gray-900'
            }`}>
              <span className="shrink-0 mt-0.5 font-bold text-base">
                {t.type === 'error' ? '!' : t.type === 'success' ? '✓' : t.type === 'warning' ? '⚠' : 'i'}
              </span>
              <div className="flex-1 min-w-0">
                {t.title && <div className="font-semibold">{t.title}</div>}
                {t.message && <div className="opacity-90">{t.message}</div>}
                {t.action && <div className="text-[11px] opacity-70 mt-1">{t.action}</div>}
              </div>
              <button onClick={() => removeToast(t.id)} className="text-gray-900/60 hover:text-gray-900 shrink-0">×</button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
