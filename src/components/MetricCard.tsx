import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Metric } from '../types'

export function MetricCard({ metric }: { metric: Metric }) {
  const isPositive = metric.change >= 0

  const formatValue = (m: Metric): string => {
    if (m.type === 'currency') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(m.value)
    }
    if (m.type === 'percentage') return `${m.value}%`
    return new Intl.NumberFormat('fr-FR').format(m.value)
  }

  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <p className="text-xs text-gray-600 mb-1">{metric.name}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold tracking-tight">{formatValue(metric)}</span>
        <span
          className={`flex items-center gap-0.5 text-xs font-medium ${
            isPositive ? 'text-emerald-600' : 'text-red-700'
          }`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(metric.change)}%
        </span>
      </div>
      {metric.unit && metric.type === 'number' && (
        <p className="text-[11px] text-gray-700 mt-0.5">{metric.unit}</p>
      )}
    </div>
  )
}
