import { useEffect, useState } from 'react'
import { formulasApi } from '../../api/ocrClient'
import { useToast } from '../../components/ui/Toast'
import { Input } from '../../components/ui/Input'

interface Formula {
  id: number
  name: string
  top_notes: string
  heart_notes: string
  base_notes: string
  file_id?: number
  thumbnail_url?: string
}

interface FormulaDetailsPageProps {
  formulaId: number
  customerId: number
  onBack: () => void
}

export default function FormulaDetailsPage({ formulaId, onBack }: FormulaDetailsPageProps) {
  const { showError, showSuccess } = useToast()
  const [formula, setFormula] = useState<Formula | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [topNotes, setTopNotes] = useState('')
  const [heartNotes, setHeartNotes] = useState('')
  const [baseNotes, setBaseNotes] = useState('')

  useEffect(() => {
    formulasApi.getById(formulaId)
      .then((f: Formula) => {
        setFormula(f)
        setTopNotes(f.top_notes || '')
        setHeartNotes(f.heart_notes || '')
        setBaseNotes(f.base_notes || '')
      })
      .catch(() => showError('Erreur', 'Impossible de charger la formule'))
      .finally(() => setLoading(false))
  }, [formulaId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await formulasApi.updateNotes(formulaId, {
        top_notes: topNotes,
        heart_notes: heartNotes,
        base_notes: baseNotes,
      })
      showSuccess('Notes enregistrées')
    } catch {
      showError('Erreur', 'Impossible de sauvegarder les notes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-48" />
        <div className="h-64 bg-gray-800 rounded-xl" />
      </div>
    )
  }

  if (!formula) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-sm">Formule introuvable</p>
        <button onClick={onBack} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300">Retour</button>
      </div>
    )
  }

  const thumbnailUrl = formula.thumbnail_url || formulasApi.getThumbnailUrl(formulaId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors">⬅</button>
        <h1 className="text-lg font-bold text-white">{formula.name}</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">🧪 Notes de la formule</h2>
        <div className="space-y-4">
          <div>
            <Input
              label="Notes de tête"
              value={topNotes}
              onChange={(e) => setTopNotes(e.target.value)}
              placeholder="Notes de tête..."
            />
          </div>
          <div>
            <Input
              label="Notes de cœur"
              value={heartNotes}
              onChange={(e) => setHeartNotes(e.target.value)}
              placeholder="Notes de cœur..."
            />
          </div>
          <div>
            <Input
              label="Notes de fond"
              value={baseNotes}
              onChange={(e) => setBaseNotes(e.target.value)}
              placeholder="Notes de fond..."
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : '💾 Enregistrer'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">🖼 Aperçu du fichier</h2>
        <div className="flex items-center justify-center bg-gray-950 rounded-lg border border-gray-800 p-4">
          <img
            src={thumbnailUrl}
            alt={formula.name}
            className="max-w-full max-h-64 rounded-lg object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-500 text-sm py-8">📄 Aperçu non disponible</div>'
            }}
          />
        </div>
      </div>

      <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">⬅ Retour au client</button>
    </div>
  )
}
