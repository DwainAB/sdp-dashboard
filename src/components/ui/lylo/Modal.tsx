import { useEffect, useId, useRef } from 'react'

interface ModalProps {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
  maxWidthClassName?: string
}

export function Modal({ open, title, children, footer, onClose, maxWidthClassName = 'max-w-2xl' }: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => panelRef.current?.focus(), 0)
    return () => window.clearTimeout(id)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative z-10 flex w-full flex-col ${maxWidthClassName} max-h-[90vh] rounded-xl border border-gray-200 bg-gray-100 shadow-xl outline-none`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-[20px] leading-none">close</span>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/40 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}
