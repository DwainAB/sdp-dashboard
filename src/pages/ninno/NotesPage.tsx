import { useEffect, useState } from 'react'
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../../api/ninnoClient'
import type { NinnoNote, NinnoNoteInput } from '../../types'
import NoteForm from '../../components/ninno/NoteForm'
import NoteList from '../../components/ninno/NoteList'

const TABS: { key: NinnoNote['type']; label: string }[] = [
  { key: 'top', label: 'Notes de tête' },
  { key: 'heart', label: 'Notes de cœur' },
  { key: 'base', label: 'Notes de fond' },
]

export default function NotesPage() {
  const [notes, setNotes] = useState<NinnoNote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<NinnoNote['type']>('top')

  function reload() {
    return getNotes().then(setNotes)
  }

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [])

  async function handleCreate(input: NinnoNoteInput) {
    await createNote(input)
    await reload()
  }

  async function handleUpdate(id: number, input: NinnoNoteInput) {
    await updateNote(id, input)
    await reload()
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette note ?')) return
    await deleteNote(id)
    await reload()
  }

  if (loading) return <p className="text-gray-500 text-sm">Chargement...</p>

  const filtered = notes.filter((n) => n.type === activeTab)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full border font-semibold text-xs transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-6 items-start">
        <div>
          <h3 className="text-gray-900 text-sm font-semibold mb-2.5">Ajouter une note</h3>
          <NoteForm type={activeTab} onSubmit={handleCreate} />
        </div>
        <div>
          <h3 className="text-gray-900 text-sm font-semibold mb-2.5">
            {TABS.find((t) => t.key === activeTab)?.label}
          </h3>
          <NoteList notes={filtered} onUpdate={handleUpdate} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}
