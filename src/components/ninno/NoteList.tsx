import { useState } from 'react'
import type { NoteInput } from '../../api/ninnoClient'
import type { NinnoNote } from '../../types'
import NoteForm from './NoteForm'

export default function NoteList({
  notes,
  onUpdate,
  onDelete,
}: {
  notes: NinnoNote[]
  onUpdate: (id: number, input: NoteInput) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [editingId, setEditingId] = useState<number | null>(null)

  if (notes.length === 0) {
    return <p className="text-gray-500 text-sm">Aucune note pour l'instant.</p>
  }

  return (
    <div className="flex flex-col gap-2.5">
      {notes.map((note) =>
        editingId === note.id ? (
          <NoteForm
            key={note.id}
            type={note.type}
            initial={note}
            onCancel={() => setEditingId(null)}
            onSubmit={async (input) => {
              await onUpdate(note.id, input)
              setEditingId(null)
            }}
          />
        ) : (
          <div
            key={note.id}
            className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl p-3"
          >
            <div className="flex gap-1 shrink-0">
              {[note.imageUrl, note.happyImageUrl, note.sadImageUrl].map((url, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-md border border-gray-200"
                  style={url ? { background: `center/cover no-repeat url(${url})` } : { background: 'var(--bg)' }}
                />
              ))}
            </div>
            <div className="flex-1 text-left">
              <strong className="text-gray-900 text-sm">{note.name}</strong>
            </div>
            <button
              onClick={() => setEditingId(note.id)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-transparent text-gray-600 text-xs hover:bg-gray-100"
            >
              Modifier
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="px-3 py-1.5 rounded-lg border-0 bg-red-50/30 text-red-700 font-semibold text-xs hover:bg-red-50/50"
            >
              Supprimer
            </button>
          </div>
        )
      )}
    </div>
  )
}
