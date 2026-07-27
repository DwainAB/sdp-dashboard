import type { Dashboard, Project } from '../types'
import { mockProjects, mockDashboards } from '../data/mockData'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const api = {
  async getProjects(): Promise<Project[]> {
    await delay(300)
    return mockProjects
  },

  async getDashboard(slug: string): Promise<Dashboard> {
    await delay(400)
    const normalized = slug === 'marketplace' ? 'aglae' : slug
    const dashboard = mockDashboards[normalized]
    if (!dashboard) throw new Error('Dashboard not found')
    return dashboard
  },
}
