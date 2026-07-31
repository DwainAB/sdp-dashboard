import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import type { Notification } from '../types'

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

function formatDate(now: Date) {
  const day = DAYS[now.getDay()]
  const date = now.getDate()
  const month = MONTHS[now.getMonth()]
  const year = now.getFullYear()
  return `${day} ${date} ${month} ${year}`
}

function formatTime(now: Date) {
  return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

interface WelcomeHeaderProps {
  firstName: string
  notifications: Notification[]
}

export function WelcomeHeader({ firstName, notifications }: WelcomeHeaderProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {firstName}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {formatDate(now)} — {formatTime(now)}
        </p>
      </div>

      <div className="bg-gray-100 rounded-xl border border-gray-200 p-3 max-w-xs">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Bell size={14} />
          Dernière notification
        </div>
        {notifications.length > 0 ? (
          <p className="text-sm text-gray-700 leading-snug">{notifications[0].message}</p>
        ) : (
          <p className="text-sm text-gray-600">Aucune notification</p>
        )}
        <p className="text-[10px] text-gray-700 mt-1">{notifications[0]?.time}</p>
      </div>
    </div>
  )
}
