import { useEffect, useState } from 'react'
import { ordersApi, filesApi } from '../../api/ocrClient'
import { useToast } from '../../components/ui/Toast'
import { ConfirmModal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'

interface Order {
  id: number
  customer_name: string
  order_type: string
  status: string
  created_at: string
  updated_at: string
  notes: string
  customer_id: number
}

interface OrderItem {
  id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface FileAttachment {
  id: number
  filename: string
  file_size: number
  uploaded_at: string
}

const STATUS_FLOW = ['pending', 'processing', 'completed', 'cancelled']

export default function OrderDetailsPage({ orderId, onBack }: { orderId: number; onBack: () => void }) {
  const { showSuccess, showError } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [showDeleteItem, setShowDeleteItem] = useState<OrderItem | null>(null)
  const [deletingItem, setDeletingItem] = useState(false)

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ordersApi.getById(orderId)
      setOrder(data)
      setNotes(data.notes || '')
      setItems(Array.isArray(data.items) ? data.items : [])
      setFiles(Array.isArray(data.files) ? data.files : (Array.isArray(data.attachments) ? data.attachments : []))
    } catch {
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [orderId])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return
    setUpdatingStatus(true)
    try {
      await ordersApi.updateStatus(order.id, newStatus)
      showSuccess(`Status updated to ${newStatus}`)
      fetchOrder()
    } catch {
      showError('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!order) return
    setSavingNotes(true)
    try {
      await ordersApi.update(order.id, { notes })
      showSuccess('Notes saved')
    } catch {
      showError('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!showDeleteItem) return
    setDeletingItem(true)
    try {
      await ordersApi.deleteItem(orderId, showDeleteItem.id)
      showSuccess('Item removed')
      setShowDeleteItem(null)
      fetchOrder()
    } catch {
      showError('Failed to remove item')
    } finally {
      setDeletingItem(false)
    }
  }

  const currentIdx = order ? STATUS_FLOW.indexOf(order.status) : -1
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-400/10 text-amber-400',
      processing: 'bg-blue-400/10 text-blue-400',
      completed: 'bg-emerald-400/10 text-emerald-400',
      cancelled: 'bg-red-400/10 text-red-400',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/10 text-gray-500'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-48" />
          <div className="h-4 bg-gray-800 rounded w-72" />
          <div className="h-4 bg-gray-800 rounded w-96" />
          <div className="h-48 bg-gray-800 rounded-xl" />
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

  if (!order) return null

  return (
    <div className="p-6">
      <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1">◀ Back to Orders</button>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-white">Order #{order.id}</h1>
              {statusBadge(order.status)}
            </div>
            <p className="text-sm text-gray-400 mt-1">{order.customer_name || `Customer #${order.customer_id}`}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>Created: {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</div>
            <div>Updated: {order.updated_at ? new Date(order.updated_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-2">Status:</span>
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-700 text-xs">→</span>}
              <button
                onClick={() => handleStatusUpdate(s)}
                disabled={updatingStatus || s === order.status}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  s === order.status
                    ? 'ring-1 ring-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                {s}
              </button>
            </div>
          ))}
          {nextStatus && nextStatus !== 'cancelled' && (
            <Button size="sm" className="ml-3" onClick={() => handleStatusUpdate(nextStatus)} loading={updatingStatus}>
              Move to {nextStatus}
            </Button>
          )}
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <Button variant="danger" size="sm" className="ml-2" onClick={() => handleStatusUpdate('cancelled')} loading={updatingStatus}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">📋 Items ({items.length})</h2>
          {items.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500 text-sm">No items</div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">Product</th>
                    <th className="text-right px-4 py-3 font-medium">Qty</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="text-right px-4 py-3 font-medium">Total</th>
                    <th className="text-right px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 text-white">{item.product_name || `Item #${item.id}`}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-300">${(item.unit_price ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-white font-medium">${(item.total_price ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setShowDeleteItem(item)}>✖</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white mb-3">📝 Notes</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none placeholder-gray-600 focus:border-indigo-500 transition-colors resize-none"
                rows={4}
                placeholder="Add notes about this order..."
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handleSaveNotes} loading={savingNotes}>Save Notes</Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white mb-3">📎 Attachments ({files.length})</h2>
            {files.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500 text-sm">No attachments</div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                {files.map(f => (
                  <div key={f.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">📄</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{f.filename}</p>
                        <p className="text-xs text-gray-500">
                          {f.file_size ? `${(f.file_size / 1024).toFixed(1)} KB` : ''}
                          {f.uploaded_at ? ` · ${new Date(f.uploaded_at).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>
                    <a
                      href={filesApi.getDownloadUrl(f.id)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium shrink-0"
                      download
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!showDeleteItem}
        onClose={() => setShowDeleteItem(null)}
        onConfirm={handleDeleteItem}
        title="Remove Item"
        message={`Remove "${showDeleteItem?.product_name || `item #${showDeleteItem?.id}`}" from this order?`}
        confirmText="Remove"
        danger
        isLoading={deletingItem}
      />
    </div>
  )
}
