import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { Chart as ChartType } from '../types'

const COLORS = ['#996F56', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899']

export function Chart({ chart }: { chart: ChartType }) {
  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-900 mb-4">{chart.title}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'line' ? (
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D9" />
              <XAxis dataKey="label" stroke="#9A8573" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9A8573" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #EAE2D9', borderRadius: 8 }}
                labelStyle={{ color: '#2B211B' }}
              />
              <Line type="monotone" dataKey="value" stroke="#996F56" strokeWidth={2} dot={false} />
            </LineChart>
          ) : chart.type === 'bar' ? (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D9" />
              <XAxis dataKey="label" stroke="#9A8573" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9A8573" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #EAE2D9', borderRadius: 8 }}
                labelStyle={{ color: '#2B211B' }}
              />
              <Bar dataKey="value" fill="#996F56" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chart.type === 'pie' ? (
            <PieChart>
              <Pie
                data={chart.data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #EAE2D9', borderRadius: 8 }}
                labelStyle={{ color: '#2B211B' }}
              />
            </PieChart>
          ) : (
            <AreaChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D9" />
              <XAxis dataKey="label" stroke="#9A8573" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9A8573" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#FFFFFF', border: '1px solid #EAE2D9', borderRadius: 8 }}
                labelStyle={{ color: '#2B211B' }}
              />
              <Area type="monotone" dataKey="value" stroke="#996F56" fill="#996F56" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
