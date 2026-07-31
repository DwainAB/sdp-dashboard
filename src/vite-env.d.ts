/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: string
    onUpdateEvent: (callback: (payload: { event: string; payload?: Record<string, unknown> }) => void) => () => void
    checkForUpdates: () => Promise<boolean>
    quitAndInstall: () => void
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
