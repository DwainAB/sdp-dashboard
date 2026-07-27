import { useEffect, useState } from 'react'
import { groupsApi, customersApi } from '../../api/ocrClient'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { ConfirmModal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'

interface Group {
  id: number
  name: string
  description: string
  member_count: number
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
}

interface CustomerOption {
  id: number
  name: string
  email: string
}

export default function GroupDetailsPage({ groupIds, onBack }: { groupIds: number[]; onBack: () => void }) {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [adding, setAdding] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Customer | null>(null)
  const [removing, setRemoving] = useState(false)

  const groupId = groupIds[0]

  const fetchGroup = async () => {
    setLoading(true)
    setError(null)
    try {
      const [gData, membersData] = await Promise.all([
        groupsApi.getById(groupId),
        groupsApi.getCustomersByGroupIds(groupIds),
      ])
      setGroup(gData)
      setMembers(Array.isArray(membersData) ? membersData : membersData.customers ?? [])
    } catch {
      setError('Failed to load group details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroup() }, [groupId])

  const openAddModal = async () => {
    setShowAddModal(true)
    setSelectedIds([])
    try {
      const data = await customersApi.getAllNoPagination()
      setCustomers(Array.isArray(data) ? data : data.customers ?? [])
    } catch {
      setCustomers([])
    }
  }

  const handleAddMembers = async () => {
    if (!selectedIds.length || !user) return
    setAdding(true)
    try {
      await groupsApi.addCustomers(groupId, selectedIds, user.id)
      showSuccess('Members added')
      setShowAddModal(false)
      fetchGroup()
    } catch {
      showError('Failed to add members')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await groupsApi.removeCustomers(groupId, [removeTarget.id])
      showSuccess('Member removed')
      setRemoveTarget(null)
      fetchGroup()
    } catch {
      showError('Failed to remove member')
    } finally {
      setRemoving(false)
    }
  }

  const toggleCustomer = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const alreadyMembers = new Set(members.map(m => m.id))

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-48" />
          <div className="h-4 bg-gray-800 rounded w-72" />
          <div className="h-64 bg-gray-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">◀ Back</button>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!group) return null

  return (
    <div className="p-6">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">◀ Back to Groups</button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">{group.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{group.description || 'No description'}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>👥</span>
            <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">Members</h2>
        <Button size="sm" onClick={openAddModal}>➕ Add Members</Button>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
          <span className="text-3xl mb-2">👤</span>
          <p className="text-sm">No members yet</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{m.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{m.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{m.phone || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(m)}>✖</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">Add Members</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors text-lg">✕</button>
            </div>
            <div className="p-6 max-h-80 overflow-y-auto space-y-1">
              {customers.filter(c => !alreadyMembers.has(c.id)).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No available customers to add</p>
              ) : (
                customers
                  .filter(c => !alreadyMembers.has(c.id))
                  .map(c => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleCustomer(c.id)}
                        className="accent-indigo-500"
                      />
                      <div>
                        <span className="text-sm text-white">{c.name || 'Unnamed'}</span>
                        <span className="text-xs text-gray-500 ml-2">{c.email}</span>
                      </div>
                    </label>
                  ))
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddMembers} loading={adding} disabled={!selectedIds.length}>Add Selected ({selectedIds.length})</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Remove "${removeTarget?.name || removeTarget?.email}" from this group?`}
        confirmText="Remove"
        danger
        isLoading={removing}
      />
    </div>
  )
}
