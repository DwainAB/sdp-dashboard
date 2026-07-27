import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { DashboardCard } from '../components/DashboardCard'
import { api } from '../api/client'
import type { Project } from '../types'

export function DashboardList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    api
      .getProjects()
      .then(setProjects)
      .catch(() => setError('Impossible de charger les projets'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-screen">
      <Sidebar mode="projects" projects={projects} collapsed={collapsed} />
      <main className="flex-1 overflow-y-auto">
        <div className="h-14 border-b border-gray-800 flex items-center px-6">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-white transition-colors text-xs"
          >
            {collapsed ? '→' : '←'}
          </button>
          <h1 className="text-sm font-semibold text-white ml-4">Tableau de bord</h1>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5 animate-pulse">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-800 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-48" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Mes projets</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {projects.length} projet{projects.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <DashboardCard key={p.id} project={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
