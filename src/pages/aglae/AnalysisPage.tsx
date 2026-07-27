import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { customersApi, ordersApi } from '../../api/ocrClient'
import { useToast } from '../../components/ui/Toast'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

interface AnalyticsData {
  distribution?: { label: string; value: number }[]
  topCustomers?: { id: number; name: string; total_orders: number; total_spent: number }[]
  total_customers?: number
}

interface Order {
  id: number
  order_type: string
  status: string
  created_at: string
  customer_name?: string
  formula_id?: number | null
}

export default function AnalysisPage() {
  const { showError, showSuccess } = useToast()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [withoutFormula, setWithoutFormula] = useState<Order[]>([])
  const [inProgress, setInProgress] = useState<Order[]>([])
  const [completed, setCompleted] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const fetchOrders = async (status: string) => {
    const res = await ordersApi.getAll(1, 100, { status })
    return res.results || res.data || res.orders || []
  }

  useEffect(() => {
    customersApi.getAnalytics()
      .then(setAnalytics)
      .catch(() => showError('Erreur', 'Impossible de charger les analytics'))
      .finally(() => setAnalyticsLoading(false))

    Promise.all([
      fetchOrders('sans_formule'),
      fetchOrders('en_cours'),
      fetchOrders('terminee'),
    ])
      .then(([wf, ip, co]) => {
        setWithoutFormula(wf)
        setInProgress(ip)
        setCompleted(co)
      })
      .catch(() => showError('Erreur', 'Impossible de charger les commandes'))
      .finally(() => setOrdersLoading(false))
  }, [])

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      showSuccess('Statut mis à jour')
      const [wf, ip, co] = await Promise.all([
        fetchOrders('sans_formule'),
        fetchOrders('en_cours'),
        fetchOrders('terminee'),
      ])
      setWithoutFormula(wf)
      setInProgress(ip)
      setCompleted(co)
    } catch {
      showError('Erreur', 'Impossible de mettre à jour le statut')
    }
  }

  const loading = analyticsLoading || ordersLoading

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-800 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-800 rounded-xl" />
          <div className="h-72 bg-gray-800 rounded-xl" />
        </div>
        <div className="h-48 bg-gray-800 rounded-xl" />
        <div className="h-48 bg-gray-800 rounded-xl" />
        <div className="h-48 bg-gray-800 rounded-xl" />
      </div>
    )
  }

  const distribution = analytics?.distribution || []
  const topCustomers = analytics?.topCustomers || []

  const renderOrderTable = (title: string, icon: string, orders: Order[], statusActions: { label: string; status: string; color: string }[]) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-white mb-4">
        {icon} {title} ({orders.length})
      </h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">Aucune commande</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Client</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Type</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                <th className="text-right py-2 px-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 px-3 text-white">{o.customer_name || `#${o.id}`}</td>
                  <td className="py-2 px-3 text-gray-300">{o.order_type}</td>
                  <td className="py-2 px-3 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex justify-end gap-1">
                      {statusActions.map((a) => (
                        <button
                          key={a.status}
                          onClick={() => handleStatusChange(o.id, a.status)}
                          className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${a.color}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-white">📊 Analyse</h1>

      {/* Client Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Répartition des clients</h2>
          {distribution.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">Aucune donnée</p>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                  >
                    {distribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f3f4f6',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {distribution.length > 0 && (
            <div className="mt-4 space-y-2">
              {distribution.map((d, i) => (
                <div key={d.label} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400">{d.label}</span>
                  <span className="ml-auto text-white font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Top clients</h2>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">Aucune donnée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 text-gray-500 font-medium">#</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Nom</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Commandes</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 text-gray-500">{i + 1}</td>
                      <td className="py-2 text-white">{c.name}</td>
                      <td className="py-2 text-right text-gray-300">{c.total_orders}</td>
                      <td className="py-2 text-right text-gray-300">{c.total_spent?.toFixed(2) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Analytics */}
      {renderOrderTable('Commandes sans formule', '⚠️', withoutFormula, [
        { label: 'En cours', status: 'en_cours', color: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10' },
      ])}

      {renderOrderTable('En cours de traitement', '🔄', inProgress, [
        { label: 'Terminer', status: 'terminee', color: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10' },
        { label: 'Sans formule', status: 'sans_formule', color: 'text-red-400 border-red-500/30 hover:bg-red-500/10' },
      ])}

      {renderOrderTable('Terminées', '✅', completed, [
        { label: 'Réouvrir', status: 'en_cours', color: 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10' },
      ])}
    </div>
  )
}
