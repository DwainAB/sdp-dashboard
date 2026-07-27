export default function LyloHomePage() {
  return (
    <div className="space-y-8 p-6">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-gray-400">Nombre de sessions</p>
            <h3 className="text-3xl font-bold text-white">12,482</h3>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-400">
              <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
              +14.5% <span className="ml-1 text-gray-500">vs mois dernier</span>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-gray-400">Nombre de visiteurs</p>
            <h3 className="text-3xl font-bold text-white">8,390</h3>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-400">
              <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
              +8.2% <span className="ml-1 text-gray-500">vs mois dernier</span>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium text-gray-400">Nombre de clients</p>
            <h3 className="text-3xl font-bold text-white">1,240</h3>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-400">
              <span className="material-symbols-outlined mr-1 text-sm">trending_up</span>
              +4.1% <span className="ml-1 text-gray-500">vs mois dernier</span>
            </div>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <h4 className="font-semibold text-white">Activités récentes</h4>
            <a className="text-xs font-medium text-indigo-400 hover:underline" href="#">Voir tout</a>
          </div>
          <div className="divide-y divide-gray-800">
            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-800/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <span className="material-symbols-outlined text-xl">person_add</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Nouveau client enregistré</p>
                <p className="text-xs text-gray-500">L'entreprise 'TechVision' vient de rejoindre la plateforme.</p>
              </div>
              <span className="text-[10px] uppercase text-gray-600">Il y a 2h</span>
            </div>
            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-800/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <span className="material-symbols-outlined text-xl">analytics</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Rapport d'analyse généré</p>
                <p className="text-xs text-gray-500">Le rapport mensuel des ventes est prêt à être exporté.</p>
              </div>
              <span className="text-[10px] uppercase text-gray-600">Il y a 5h</span>
            </div>
            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-800/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Alerte de sécurité</p>
                <p className="text-xs text-gray-500">Tentative de connexion inhabituelle détectée à Paris.</p>
              </div>
              <span className="text-[10px] uppercase text-gray-600">Hier</span>
            </div>
            <div className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-800/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                <span className="material-symbols-outlined text-xl">groups</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Nouvel équipier</p>
                <p className="text-xs text-gray-500">Sarah Martin a été ajoutée à l'équipe Marketing.</p>
              </div>
              <span className="text-[10px] uppercase text-gray-600">2 jours</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h4 className="mb-6 font-semibold text-white">Raccourcis</h4>
          <div className="space-y-3">
            <button type="button" className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-gray-950 p-3 text-gray-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-600/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <span className="material-symbols-outlined text-lg">person_add</span>
              </div>
              <span className="text-sm font-medium">Ajouter un client</span>
            </button>
            <button type="button" className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-gray-950 p-3 text-gray-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-600/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <span className="material-symbols-outlined text-lg">description</span>
              </div>
              <span className="text-sm font-medium">Éditer une facture</span>
            </button>
            <button type="button" className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-gray-950 p-3 text-gray-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-600/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <span className="material-symbols-outlined text-lg">monitoring</span>
              </div>
              <span className="text-sm font-medium">Lancer une analyse</span>
            </button>
            <button type="button" className="group flex w-full items-center gap-3 rounded-lg border border-transparent bg-gray-950 p-3 text-gray-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-600/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <span className="material-symbols-outlined text-lg">settings</span>
              </div>
              <span className="text-sm font-medium">Paramètres système</span>
            </button>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-6">
            <div className="rounded-lg border border-indigo-500/10 bg-indigo-600/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">Besoin d'aide ?</p>
              <p className="mb-4 text-xs leading-relaxed text-gray-400">Consultez notre base de connaissances pour maîtriser Lylo.</p>
              <button type="button" className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline">
                Accéder au support <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
