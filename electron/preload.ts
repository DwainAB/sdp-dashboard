import { contextBridge, ipcRenderer } from 'electron'

export interface UpdateEventPayload {
  event: string
  payload?: Record<string, unknown>
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  onUpdateEvent: (callback: (payload: UpdateEventPayload) => void) => {
    const listener = (_event: unknown, payload: UpdateEventPayload) => callback(payload)
    ipcRenderer.on('update:event', listener)
    return () => ipcRenderer.removeListener('update:event', listener)
  },
  checkForUpdates: () => ipcRenderer.invoke('update:check') as Promise<boolean>,
  quitAndInstall: () => ipcRenderer.send('update:quit-and-install'),
})
