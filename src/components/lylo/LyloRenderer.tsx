import LyloHomePage from '../../pages/lylo/LyloHomePage'
import LyloClientsPage from '../../pages/lylo/LyloClientsPage'
import LyloTeamPage from '../../pages/lylo/LyloTeamPage'
import LyloFormulesPage from '../../pages/lylo/LyloFormulesPage'
import LyloQuestionnairePage from '../../pages/lylo/LyloQuestionnairePage'
import LyloIngredientsPage from '../../pages/lylo/LyloIngredientsPage'
import LyloImprimantesPage from '../../pages/lylo/LyloImprimantesPage'
import LyloAnalysesPage from '../../pages/lylo/LyloAnalysesPage'

const LYLO_PAGES: Record<string, React.ComponentType> = {
  accueil: LyloHomePage,
  clients: LyloClientsPage,
  equipe: LyloTeamPage,
  formules: LyloFormulesPage,
  questionnaire: LyloQuestionnairePage,
  ingredients: LyloIngredientsPage,
  imprimantes: LyloImprimantesPage,
  analyses: LyloAnalysesPage,
}

export default function LyloRenderer({ section }: { section: string }) {
  const Page = LYLO_PAGES[section]
  if (!Page) return <div className="text-sm text-gray-400 p-6">Section inconnue</div>
  return <Page />
}
