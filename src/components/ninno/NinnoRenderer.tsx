import AppearancePage from '../../pages/ninno/AppearancePage'
import NotesPage from '../../pages/ninno/NotesPage'

export default function NinnoRenderer({ section }: { section: string }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-gray-900">
        {section === 'appearance' ? 'Apparence' : 'Notes olfactives'}
      </h2>

      {section === 'appearance' ? <AppearancePage /> : <NotesPage />}
    </div>
  )
}
