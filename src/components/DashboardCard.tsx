import { useNavigate } from 'react-router-dom'
import { Activity, AlertCircle, Wrench } from 'lucide-react'
import type { Project } from '../types'

const statusConfig = {
  active: { icon: Activity, color: 'text-emerald-400', label: 'Actif' },
  inactive: { icon: AlertCircle, color: 'text-gray-500', label: 'Inactif' },
  maintenance: { icon: Wrench, color: 'text-amber-400', label: 'Maintenance' },
}

export function DashboardCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  return (
    <button
      onClick={() => navigate(`/project/${project.slug}`)}
      className="bg-gray-900 rounded-xl border border-gray-800 p-5 text-left hover:border-gray-700 hover:bg-gray-800/50 transition-all group w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: project.color }}
        >
          {project.name.charAt(0)}
        </div>
        <span className={`flex items-center gap-1 text-xs ${status.color}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
      </div>
      <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
        {project.name}
      </h3>
      <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
    </button>
  )
}
