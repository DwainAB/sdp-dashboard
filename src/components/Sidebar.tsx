import { NavLink } from 'react-router-dom'
import { Shield, BarChart3, LayoutDashboard, ArrowLeftRight, Euro, ShoppingCart, Store, Users, Activity, Database, Server, BarChart, Headphones, FileText, Tablet, Image, StickyNote, Settings, LogOut, LucideIcon } from 'lucide-react'
import type { DashboardSection, Project } from '../types'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, ArrowLeftRight, Euro, ShoppingCart, Store,
  Users, Activity, Database, Server, BarChart3, BarChart, Headphones,
  FileText, Tablet, Image, StickyNote,
}

interface ProjectsMode {
  mode: 'projects'
  projects: Project[]
  collapsed: boolean
}

interface SectionsMode {
  mode: 'sections'
  sections: DashboardSection[]
  activeSection: string
  onSectionChange: (id: string) => void
  collapsed: boolean
  userMode?: boolean
  onOpenSettings?: () => void
}

type SidebarProps = ProjectsMode | SectionsMode

export function Sidebar(props: SidebarProps) {
  if (props.mode === 'projects') {
    const { projects, collapsed } = props
    return (
      <aside className={`bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-800 ">
          <BarChart3 size={22} className="text-indigo-400 shrink-0" />
          {!collapsed && <span className="font-bold text-sm truncate">SDP Dashboard</span>}
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavLink to="/" end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
            }
          >
            <LayoutDashboard size={18} className="shrink-0" />
            {!collapsed && 'Tous les projets'}
          </NavLink>
          {!collapsed && <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold px-4 pt-4 pb-1">Projets</p>}
          <NavLink to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
            }
            title={collapsed ? 'Administration' : undefined}
          >
            <Shield size={18} className="shrink-0" />
            {!collapsed && 'Administration'}
          </NavLink>
          {projects.map((p) => (
            <NavLink key={p.id} to={`/project/${p.slug}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
              }
              title={collapsed ? p.name : undefined}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              {!collapsed && <span className="truncate">{p.name}</span>}
            </NavLink>
          ))}
        </div>
      </aside>
    )
  }

  const { sections, activeSection, onSectionChange, collapsed, userMode, onOpenSettings } = props
  return (
    <aside className={`bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-800">
        <BarChart3 size={22} className="text-indigo-400 shrink-0" />
        {!collapsed && <span className="font-bold text-sm truncate">SDP Dashboard</span>}
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {!collapsed && <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold px-4 pt-4 pb-1">Sections</p>}
        {sections.map((s) => {
          const Icon = iconMap[s.icon] || LayoutDashboard
          const isActive = activeSection === s.id
          return (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${isActive ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              title={collapsed ? s.name : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{s.name}</span>}
            </button>
          )
        })}
      </div>

      {userMode && (
        <div className="border-t border-gray-800 py-2">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-left"
            title={collapsed ? 'Paramètres' : undefined}
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && 'Paramètres'}
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors text-left"
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && 'Déconnexion'}
          </button>
        </div>
      )}
    </aside>
  )
}
