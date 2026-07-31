import { useState } from 'react'
import type { NoteInput } from '../../api/ninnoClient'
import type { NinnoNote } from '../../types'

type ImageFieldKey = 'image' | 'happyImage' | 'sadImage' | 'happyAnim' | 'sadAnim'

const IMAGE_FIELDS: { key: ImageFieldKey; urlKey: keyof NinnoNote; label: string; accept: string }[] = [
  { key: 'image', urlKey: 'imageUrl', label: 'Image normale', accept: 'image/*' },
  { key: 'happyImage', urlKey: 'happyImageUrl', label: 'Image contente', accept: 'image/*' },
  { key: 'sadImage', urlKey: 'sadImageUrl', label: 'Image triste', accept: 'image/*' },
  { key: 'happyAnim', urlKey: 'happyAnimUrl', label: 'Animation contente (optionnel)', accept: 'image/webp' },
  { key: 'sadAnim', urlKey: 'sadAnimUrl', label: 'Animation triste (optionnel)', accept: 'image/webp' },
]

function NoteImageField({
  label,
  accept,
  currentUrl,
  onChange,
}: {
  label: string
  accept: string
  currentUrl: string | null
  onChange: (file: File | null) => void
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const displayUrl = preview ?? currentUrl

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-12 h-12 shrink-0 rounded-lg border border-gray-200"
        style={displayUrl ? { background: `center/cover no-repeat url(${displayUrl})` } : { background: 'var(--bg)' }}
      />
      <div className="flex-1 text-left">
        <label className="block text-xs text-gray-500 mb-0.5">{label}</label>
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null
            onChange(file)
            setPreview(file ? URL.createObjectURL(file) : null)
          }}
          className="text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
        />
      </div>
    </div>
  )
}

export default function NoteForm({
  type,
  initial,
  onSubmit,
  onCancel,
}: {
  type: 'top' | 'heart' | 'base'
  initial?: NinnoNote
  onSubmit: (input: NoteInput) => Promise<void>
  onCancel?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [images, setImages] = useState<Record<ImageFieldKey, File | null>>({
    image: null,
    happyImage: null,
    sadImage: null,
    happyAnim: null,
    sadAnim: null,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ name, type, ...images })
      if (!initial) {
        setName('')
        setImages({ image: null, happyImage: null, sadImage: null, happyAnim: null, sadAnim: null })
      }
    } catch {
      setError("Échec de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2.5 bg-gray-100 border border-gray-200 rounded-xl p-4"
    >
      <input
        className="w-full px-2.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {IMAGE_FIELDS.map((field) => (
        <NoteImageField
          key={field.key}
          label={field.label}
          accept={field.accept}
          currentUrl={(initial?.[field.urlKey] as string | null) ?? null}
          onChange={(file) => setImages((prev) => ({ ...prev, [field.key]: file }))}
        />
      ))}

      {error && <p className="text-red-700 text-xs m-0">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !name}
          className="px-4 py-2 rounded-lg border-0 font-semibold text-white text-xs transition-opacity disabled:opacity-60 bg-indigo-600 hover:bg-indigo-500"
        >
          {saving ? 'Enregistrement...' : initial ? 'Mettre à jour' : 'Ajouter'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-transparent text-gray-600 text-xs hover:bg-gray-100"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
