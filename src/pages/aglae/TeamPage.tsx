import { useEffect, useState, useCallback } from 'react'
import { usersApi, rolesApi } from '../../api/ocrClient'
import { useToast } from '../../components/ui/Toast'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { formatLastLogin } from '../../utils/timeUtils'

interface TeamMember {
  id: number
  email: string
  name: string
  first_name: string
  last_name: string
  identifier?: string
  phone?: string
  team: string | null
  role: { id: number; name: string }
  is_online: boolean
  last_login_at?: string | null
}

interface Role {
  id: number
  name: string
}

export default function TeamPage() {
  const { showError, showSuccess, showWarning } = useToast()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [rolesModalOpen, setRolesModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({ email: '', first_name: '', last_name: '', role_id: '', team: '' })
  const [adding, setAdding] = useState(false)
  const [roleForm, setRoleForm] = useState({ name: '' })
  const [creatingRole, setCreatingRole] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersData, rolesData] = await Promise.all([usersApi.getAll(), rolesApi.getAll()])
      setMembers(Array.isArray(usersData) ? usersData : usersData.users || usersData.results || usersData.data || [])
      const roleList = Array.isArray(rolesData) ? rolesData : rolesData.roles || rolesData.results || rolesData.data || []
      setRoles(roleList)
    } catch {
      setError('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredMembers = members.filter(m => {
    if (search) {
      const q = search.toLowerCase()
      if (!m.name?.toLowerCase().includes(q) && !m.email?.toLowerCase().includes(q) && !m.first_name?.toLowerCase().includes(q) && !m.last_name?.toLowerCase().includes(q)) return false
    }
    if (roleFilter && m.role?.name !== roleFilter) return false
    if (teamFilter && m.team !== teamFilter) return false
    if (onlineOnly && !m.is_online) return false
    return true
  })

  const teams = Array.from(new Set(members.map(m => m.team).filter(Boolean))) as string[]

  const handleAddMember = async () => {
    if (!addForm.email || !addForm.first_name || !addForm.last_name) { showWarning('Champs requis'); return }
    setAdding(true)
    try {
      await usersApi.create({
        email: addForm.email,
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        role_id: addForm.role_id ? Number(addForm.role_id) : undefined,
        team: addForm.team || undefined,
      })
      showSuccess('Membre ajouté')
      setAddModalOpen(false)
      setAddForm({ email: '', first_name: '', last_name: '', role_id: '', team: '' })
      fetchData()
    } catch {
      showError('Erreur lors de l\'ajout')
    } finally {
      setAdding(false)
    }
  }

  const handleCreateRole = async () => {
    if (!roleForm.name) { showWarning('Nom du rôle requis'); return }
    setCreatingRole(true)
    try {
      await rolesApi.create({ name: roleForm.name })
      showSuccess('Rôle créé')
      setRoleForm({ name: '' })
      const rolesData = await rolesApi.getAll()
      const roleList = Array.isArray(rolesData) ? rolesData : rolesData.roles || rolesData.results || rolesData.data || []
      setRoles(roleList)
    } catch {
      showError('Erreur lors de la création')
    } finally {
      setCreatingRole(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  const roleBadge = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      user: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      viewer: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    }
    return colors[roleName?.toLowerCase()] || 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-800 rounded w-24" />
                  <div className="h-3 bg-gray-800 rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-gray-800 rounded w-32" />
              <div className="h-3 bg-gray-800 rounded w-28" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">👥 Équipe</h1>
          <p className="text-xs text-gray-500 mt-0.5">{members.length} membre{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddModalOpen(true)}>➕ Ajouter</Button>
          <Button variant="secondary" size="sm" onClick={() => setRolesModalOpen(true)}>🔧 Rôles</Button>
          <Button variant="ghost" size="sm" onClick={fetchData}>🔄</Button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="🔍 Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Rôle</label>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors">
              <option value="">Tous</option>
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Équipe</label>
            <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors">
              <option value="">Toutes</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={e => setOnlineOnly(e.target.checked)}
                className="accent-indigo-500"
              />
              <span className="text-sm text-gray-300">En ligne uniquement</span>
            </label>
          </div>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <span className="text-3xl mb-2">👥</span>
          <p className="text-sm">Aucun membre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMember(m)}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400">
                    {getInitials(m.name || `${m.first_name} ${m.last_name}`)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.name || `${m.first_name} ${m.last_name}`}</p>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium ${roleBadge(m.role?.name || '')}`}>
                      {m.role?.name || '—'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className={`w-2 h-2 rounded-full ${m.is_online ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  <span className="text-gray-500">{formatLastLogin(m.last_login_at, m.is_online)}</span>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-gray-400 truncate">📧 {m.email}</p>
                {m.identifier && <p className="text-gray-500 font-mono">🆔 {m.identifier}</p>}
                {m.phone && <p className="text-gray-400">📞 {m.phone}</p>}
                {m.team && <p className="text-gray-400">🏢 {m.team}</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <a href={`mailto:${m.email}`} onClick={e => e.stopPropagation()} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  📧 Envoyer un email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">Détails du membre</h2>
              <button onClick={() => setSelectedMember(null)} className="text-gray-500 hover:text-white transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400">
                  {getInitials(selectedMember.name || `${selectedMember.first_name} ${selectedMember.last_name}`)}
                </div>
                <div>
                  <p className="text-base font-medium text-white">{selectedMember.name || `${selectedMember.first_name} ${selectedMember.last_name}`}</p>
                  <span className={`inline-flex items-center gap-1 text-xs ${selectedMember.is_online ? 'text-emerald-400' : 'text-gray-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${selectedMember.is_online ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                    {formatLastLogin(selectedMember.last_login_at, selectedMember.is_online)}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-white">{selectedMember.email}</span></div>
                {selectedMember.identifier && <div className="flex justify-between"><span className="text-gray-500">Identifiant</span><span className="text-white font-mono">{selectedMember.identifier}</span></div>}
                {selectedMember.phone && <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="text-white">{selectedMember.phone}</span></div>}
                {selectedMember.team && <div className="flex justify-between"><span className="text-gray-500">Équipe</span><span className="text-white">{selectedMember.team}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Rôle</span><span className="text-white">{selectedMember.role?.name || '—'}</span></div>
              </div>
              <div className="flex justify-end pt-2">
                <a href={`mailto:${selectedMember.email}`} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">📧 Envoyer un email</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAddModalOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">➕ Ajouter un membre</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-500 hover:text-white transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 space-y-3">
              <Input label="Email" type="email" placeholder="email@exemple.com" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
              <Input label="Prénom" placeholder="Jean" value={addForm.first_name} onChange={e => setAddForm(f => ({ ...f, first_name: e.target.value }))} />
              <Input label="Nom" placeholder="Dupont" value={addForm.last_name} onChange={e => setAddForm(f => ({ ...f, last_name: e.target.value }))} />
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Rôle</label>
                <select value={addForm.role_id} onChange={e => setAddForm(f => ({ ...f, role_id: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors">
                  <option value="">Sélectionner...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <Input label="Équipe" placeholder="Équipe (optionnel)" value={addForm.team} onChange={e => setAddForm(f => ({ ...f, team: e.target.value }))} />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setAddModalOpen(false)}>Annuler</Button>
                <Button onClick={handleAddMember} loading={adding}>Ajouter</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rolesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRolesModalOpen(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">🔧 Gestion des rôles</h2>
              <button onClick={() => setRolesModalOpen(false)} className="text-gray-500 hover:text-white transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {roles.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-gray-950 rounded-lg border border-gray-800">
                    <span className="text-sm text-white">{r.name}</span>
                    <span className="text-[10px] text-gray-500">ID: {r.id}</span>
                  </div>
                ))}
                {roles.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Aucun rôle défini</p>}
              </div>
              <div className="border-t border-gray-800 pt-4 space-y-3">
                <p className="text-xs font-medium text-gray-400">Créer un nouveau rôle</p>
                <Input placeholder="Nom du rôle" value={roleForm.name} onChange={e => setRoleForm({ name: e.target.value })} />
                <Button onClick={handleCreateRole} loading={creatingRole} className="w-full">Créer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
