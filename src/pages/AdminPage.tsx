import { useEffect, useState } from 'react'
import { BarChart3, Shield, Plus, Trash2, Save, Settings, Mail, RotateCw, X as XIcon } from 'lucide-react'
import { adminClient, type AdminProject, type ProjectNote, type AdminUser, type AdminRole, type UserProject } from '../api/adminClient'
import { api } from '../api/client'
import type { Project } from '../types'

type Tab = 'projects' | 'users' | 'roles'

const RESOURCES = ['dashboard', 'lylo', 'aglae', 'ninno', 'users'] as const
const ACTIONS = ['view', 'edit'] as const
const PERMISSION_LEVELS = ['none', 'view', 'edit', 'admin'] as const

interface AdminPageProps {
  embedded?: boolean
  section?: string
  onSectionChange?: (id: string) => void
}

export default function AdminPage({ embedded, section, onSectionChange: _onSectionChange }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>('projects')

  const activeTab = (section || tab) as Tab

  if (embedded) {
    return (
      <div className="space-y-4">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'roles' && <RolesTab />}
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-gray-800">
          <BarChart3 size={22} className="text-indigo-400 shrink-0" />
          <span className="font-bold text-sm truncate text-white">Administration</span>
        </div>
        <nav className="flex-1 py-2">
          {([['projects', 'Projets'], ['users', 'Utilisateurs'], ['roles', 'Rôles']] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                tab === id ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Shield size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'roles' && <RolesTab />}
      </main>
    </div>
  )
}

// ──────────────────── PROJECTS TAB ────────────────────

function ProjectsTab() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [notes, setNotes] = useState<Record<number, ProjectNote[]>>({})
  const [expanded, setExpanded] = useState<number | null>(null)
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<ProjectNote['type']>('info')

  useEffect(() => {
    api.getProjects().then(setProjects)
  }, [])

  const toggleExpand = async (id: number) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!notes[id]) {
      const n = await adminClient.getNotes(id)
      setNotes(prev => ({ ...prev, [id]: n }))
    }
  }

  const toggleStatus = async (p: AdminProject) => {
    const status = p.status === 'active' ? 'maintenance' : 'active'
    const updated = await adminClient.updateProject(p.id, { status })
    setProjects(prev => prev.map(x => x.id === p.id ? updated : x))
  }

  const addNote = async (projectId: number) => {
    if (!newNote.trim()) return
    const n = await adminClient.addNote(projectId, newNote, noteType)
    setNotes(prev => ({ ...prev, [projectId]: [n, ...(prev[projectId] || [])] }))
    setNewNote('')
  }

  const deleteNote = async (projectId: number, noteId: number) => {
    await adminClient.deleteNote(projectId, noteId)
    setNotes(prev => ({ ...prev, [projectId]: prev[projectId]?.filter(n => n.id !== noteId) || [] }))
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Gestion des projets</h1>
      <div className="space-y-3">
        {projects.map(p => (
          <div key={p.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <button onClick={() => toggleExpand(p.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-sm font-medium text-white flex-1 text-left">{p.name}</span>
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                {p.status === 'active' ? 'Actif' : 'Maintenance'}
              </span>
              <button onClick={(e) => { e.stopPropagation(); toggleStatus(p) }} className="text-xs text-gray-500 hover:text-white transition-colors">
                {p.status === 'active' ? 'Désactiver' : 'Activer'}
              </button>
            </button>
            {expanded === p.id && (
              <div className="border-t border-gray-800 p-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Ajouter une note..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                    onKeyDown={e => e.key === 'Enter' && addNote(p.id)}
                  />
                  <select value={noteType} onChange={e => setNoteType(e.target.value as any)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="update">Update</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <button onClick={() => addNote(p.id)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                {notes[p.id]?.length === 0 && <p className="text-gray-500 text-sm">Aucune note</p>}
                {notes[p.id]?.map(n => (
                  <div key={n.id} className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded mt-0.5 ${
                      n.type === 'warning' ? 'bg-amber-400/10 text-amber-400' :
                      n.type === 'update' ? 'bg-blue-400/10 text-blue-400' :
                      n.type === 'maintenance' ? 'bg-red-400/10 text-red-400' :
                      'bg-gray-600/10 text-gray-400'
                    }`}>{n.type}</span>
                    <p className="text-sm text-gray-300 flex-1">{n.content}</p>
                    <span className="text-[10px] text-gray-600">{new Date(n.created_at).toLocaleDateString('fr-FR')}</span>
                    <button onClick={() => deleteNote(p.id, n.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ──────────────────── USERS TAB ────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userProjects, setUserProjects] = useState<UserProject[]>([])
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<AdminUser>>({})
  const [showNew, setShowNew] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', first_name: '', last_name: '', role_id: 0 })
  const [error, setError] = useState<string | null>(null)
  const [showRoles, setShowRoles] = useState(false)

  useEffect(() => {
    Promise.all([
      adminClient.getUsers(),
      adminClient.getRoles(),
    ]).then(([u, r]) => {
      setUsers(u)
      setRoles(r)
    }).catch(err => setError(err.message))
  }, [])

  const openUser = async (u: AdminUser) => {
    setSelectedUser(u)
    setEditing(false)
    setEditData({ ...u })
    const up = await adminClient.getUserProjects(u.id)
    setUserProjects(up)
  }

  const saveEdit = async () => {
    if (!selectedUser || !editData) return
    const updated = await adminClient.updateUser(selectedUser.id, editData)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    setSelectedUser(updated)
    setEditing(false)
  }

  const saveNew = async () => {
    if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.role_id) return
    const created = await adminClient.createUser(newUser)
    setUsers(prev => [...prev, created])
    setShowNew(false)
    setNewUser({ email: '', first_name: '', last_name: '', role_id: roles[0]?.id || 0 })
  }

  const resetPwd = async (email: string) => {
    await adminClient.resetPassword(email)
    alert('Mot de passe réinitialisé, email envoyé')
  }

  const remove = async (id: number) => {
    await adminClient.deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
    setSelectedUser(null)
  }

  const toggleProjectPermission = (projectId: number) => {
    setUserProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const levels = ['none', 'view', 'edit', 'admin'] as const
      const idx = levels.indexOf((p.permission as any) || 'none')
      return { ...p, permission: levels[(idx + 1) % levels.length] }
    }))
  }

  if (showRoles) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setShowRoles(false)} className="text-gray-400 hover:text-white text-sm transition-colors">← Retour aux utilisateurs</button>
        </div>
        <RolesTab />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Gestion des utilisateurs</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowRoles(true)} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
            <Shield size={16} /> Gérer les rôles
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm transition-colors">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {users.map(u => (
          <button key={u.id} onClick={() => openUser(u)} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-700 transition-colors group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-bold shrink-0">
                {u.first_name[0]}{u.last_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{u.first_name} {u.last_name}</p>
                <p className="text-xs text-gray-500 truncate">{u.pseudo}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{u.role_name}</span>
              <a href={`mailto:${u.email}`} onClick={e => e.stopPropagation()} className="ml-auto text-gray-500 hover:text-indigo-400 transition-colors">
                <Mail size={14} />
              </a>
            </div>
          </button>
        ))}
      </div>

      {/* New user form */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNew(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white">Nouvel utilisateur</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prénom</label>
                <input value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nom</label>
                <input value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Rôle</label>
              <select value={newUser.role_id} onChange={e => setNewUser({ ...newUser, role_id: Number(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                <option value={0}>Sélectionner...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={saveNew} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">Créer</button>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setSelectedUser(null); setEditing(false) }}>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-lg font-bold">
                  {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedUser.first_name} {selectedUser.last_name}</h2>
                  <p className="text-xs text-gray-500">{selectedUser.pseudo}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedUser(null); setEditing(false) }} className="text-gray-500 hover:text-white">
                <XIcon size={18} />
              </button>
            </div>

            {/* Info / Edit mode */}
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Prénom</label>
                    <input value={editData.first_name || ''} onChange={e => setEditData({ ...editData, first_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nom</label>
                    <input value={editData.last_name || ''} onChange={e => setEditData({ ...editData, last_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Email</label>
                  <input value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Rôle</label>
                  <select value={editData.role_id || ''} onChange={e => setEditData({ ...editData, role_id: Number(e.target.value) })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Accès projets</label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {userProjects.map(p => (
                      <button key={p.id} onClick={() => toggleProjectPermission(p.id)} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 transition-colors">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="flex-1 text-left text-gray-300">{p.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${p.permission === 'admin' ? 'bg-purple-400/10 text-purple-400' : p.permission === 'edit' ? 'bg-blue-400/10 text-blue-400' : p.permission === 'view' ? 'bg-emerald-400/10 text-emerald-400' : 'text-gray-600'}`}>
                          {p.permission || 'none'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={saveEdit} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"><Save size={14} /> Enregistrer</button>
                  <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Email</span><p className="text-white">{selectedUser.email}</p></div>
                  <div><span className="text-gray-500">Pseudo</span><p className="text-white">{selectedUser.pseudo}</p></div>
                  <div><span className="text-gray-500">Rôle</span><p className="text-white">{selectedUser.role_name}</p></div>
                  <div><span className="text-gray-500">Statut</span><p className={selectedUser.is_active ? 'text-emerald-400' : 'text-red-400'}>{selectedUser.is_active ? 'Actif' : 'Inactif'}</p></div>
                  <div className="col-span-2"><span className="text-gray-500">Dernière connexion</span><p className="text-white">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString('fr-FR') + ' ' + new Date(selectedUser.last_login).toLocaleTimeString('fr-FR') : 'Jamais'}</p></div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Accès projets</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userProjects.filter(p => p.permission).length === 0 && <span className="text-xs text-gray-600">Aucun</span>}
                    {userProjects.filter(p => p.permission).map(p => (
                      <span key={p.id} className={`text-[10px] px-1.5 py-0.5 rounded ${p.permission === 'admin' ? 'bg-purple-400/10 text-purple-400' : p.permission === 'edit' ? 'bg-blue-400/10 text-blue-400' : 'bg-emerald-400/10 text-emerald-400'}`}>{p.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {editing ? null : (
                <>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"><Settings size={14} /> Modifier</button>
                  <button onClick={() => resetPwd(selectedUser.email)} className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-4 py-2 rounded-lg text-sm transition-colors"><RotateCw size={14} /> Réinitialiser mot de passe</button>
                  <a href={`mailto:${selectedUser.email}`} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"><Mail size={14} /> Envoyer un email</a>
                  <button onClick={() => remove(selectedUser.id)} className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors ml-auto"><Trash2 size={14} /> Supprimer</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm text-center py-4 bg-red-400/10 rounded-lg mb-4">{error}</p>}
      {users.length === 0 && !showNew && !error && (
        <p className="text-gray-500 text-sm text-center py-12">Aucun utilisateur</p>
      )}
    </div>
  )
}

// ──────────────────── ROLES TAB ────────────────────

function RolesTab() {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [editing, setEditing] = useState<AdminRole | null>(null)
  const [pagePerms, setPagePerms] = useState<Record<string, string[]>>({})
  const [projectPerms, setProjectPerms] = useState<Record<number, string>>({})
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    adminClient.getRoles().then(setRoles)
    api.getProjects().then(setProjects)
  }, [])

  const openNew = () => {
    setIsNew(true)
    setEditing({ id: 0, name: '', description: '', permissions: [], created_at: '' })
    setPagePerms({})
    setProjectPerms({})
  }

  const openEdit = async (r: AdminRole) => {
    setIsNew(false)
    setEditing(r)
    const perms = await adminClient.getRolePermissions(r.id)
    const pp: Record<string, string[]> = {}
    for (const p of perms.page_permissions) {
      if (!pp[p.resource]) pp[p.resource] = []
      pp[p.resource].push(p.action)
    }
    setPagePerms(pp)
    const pj: Record<number, string> = {}
    for (const p of perms.project_permissions) pj[p.project_id] = p.permission
    setProjectPerms(pj)
  }

  const togglePageAction = (resource: string, action: string) => {
    setPagePerms(prev => {
      const current = prev[resource] || []
      return { ...prev, [resource]: current.includes(action) ? current.filter(a => a !== action) : [...current, action] }
    })
  }

  const setProjectPermission = (projectId: number, permission: string) => {
    setProjectPerms(prev => ({ ...prev, [projectId]: permission }))
  }

  const save = async () => {
    if (!editing) return
    let role: AdminRole
    if (isNew) {
      role = await adminClient.createRole({ name: editing.name, description: editing.description || '' })
      setRoles(prev => [...prev, role])
    } else {
      await adminClient.updateRole(editing.id, { name: editing.name, description: editing.description })
      role = editing
    }
    const pagePermissions: Array<{ resource: string; action: string }> = []
    for (const [resource, actions] of Object.entries(pagePerms)) {
      for (const action of actions) pagePermissions.push({ resource, action })
    }
    const projectPermissions: Array<{ project_id: number; permission: string }> = []
    for (const [projectId, permission] of Object.entries(projectPerms)) {
      if (permission !== 'none') projectPermissions.push({ project_id: Number(projectId), permission })
    }
    await adminClient.updateRolePermissions(role.id, { page_permissions: pagePermissions, project_permissions: projectPermissions })
    const updated = await adminClient.getRoles()
    setRoles(updated)
    setEditing(null)
  }

  const remove = async (id: number) => {
    try {
      await adminClient.deleteRole(id)
      setRoles(prev => prev.filter(r => r.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (editing) {
    return (
      <div>
        <h1 className="text-xl font-bold text-white mb-6">{isNew ? 'Nouveau rôle' : 'Modifier rôle'}</h1>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-6 max-w-2xl">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nom du rôle</label>
            <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <input value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Permissions par page</label>
            <div className="space-y-2">
              {RESOURCES.map(resource => (
                <div key={resource} className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-white w-24">{resource}</span>
                  {ACTIONS.map(action => (
                    <label key={action} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={pagePerms[resource]?.includes(action) || false} onChange={() => togglePageAction(resource, action)} className="accent-indigo-500" />
                      <span className="text-xs text-gray-400">{action}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Permissions par projet</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-gray-300 flex-1">{p.name}</span>
                  <select value={projectPerms[p.id] || 'none'} onChange={e => setProjectPermission(p.id, e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white">
                    {PERMISSION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"><Save size={14} /> Enregistrer</button>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">Annuler</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Gestion des rôles</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"><Plus size={16} /> Ajouter</button>
      </div>
      <div className="space-y-2">
        {roles.map(r => (
          <div key={r.id} className="flex items-center gap-3 bg-gray-900 rounded-xl border border-gray-800 px-4 py-3">
            <Shield size={18} className="text-indigo-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{r.name}</p>
              <p className="text-xs text-gray-500">{r.description}</p>
            </div>
            <button onClick={() => openEdit(r)} className="text-gray-500 hover:text-white transition-colors"><Settings size={14} /></button>
            <button onClick={() => remove(r.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
