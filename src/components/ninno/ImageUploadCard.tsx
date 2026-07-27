import { useRef, useState } from 'react'

export default function ImageUploadCard({
  title,
  description,
  currentUrl,
  onUpload,
}: {
  title: string
  description: string
  currentUrl: string
  onUpload: (file: File) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setError(null)
  }

  async function handleSave() {
    if (!file) return
    setSaving(true)
    setError(null)
    try {
      await onUpload(file)
      setFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      setError("Échec de l'envoi. Réessayez.")
    } finally {
      setSaving(false)
    }
  }

  const displayUrl = preview ?? currentUrl

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col gap-3">
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-gray-400 text-xs mt-1">{description}</p>
      </div>

      <div
        className="h-40 rounded-lg border border-gray-800 flex items-center justify-center text-gray-500 text-sm"
        style={displayUrl ? { background: `center/cover no-repeat url(${displayUrl})` } : undefined}
      >
        {!displayUrl && 'Aucune image'}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500" />

      {error && <p className="text-red-400 text-xs m-0">{error}</p>}

      <button
        onClick={handleSave}
        disabled={!file || saving}
        className="self-start px-4 py-2 rounded-lg border-0 font-semibold text-white text-xs transition-opacity disabled:opacity-60 bg-indigo-600 hover:bg-indigo-500"
      >
        {saving ? 'Envoi...' : 'Enregistrer'}
      </button>
    </div>
  )
}
