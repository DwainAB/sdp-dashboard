/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: string
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
