import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function sendUpdateEvent(event: string, payload?: Record<string, unknown>) {
  if (win && !win.isDestroyed()) {
    win.webContents.send('update:event', { event, payload })
  }
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => sendUpdateEvent('checking-for-update'))
  autoUpdater.on('update-available', info =>
    sendUpdateEvent('update-available', { version: info.version })
  )
  autoUpdater.on('update-not-available', () => sendUpdateEvent('update-not-available'))
  autoUpdater.on('download-progress', progress =>
    sendUpdateEvent('download-progress', { percent: Math.round(progress.percent) })
  )
  autoUpdater.on('update-downloaded', info =>
    sendUpdateEvent('update-downloaded', { version: info.version })
  )
  autoUpdater.on('error', err =>
    sendUpdateEvent('error', { message: err.message })
  )

  const check = () => {
    autoUpdater.checkForUpdates().catch(() => {})
  }
  check()
  setInterval(check, 60 * 60 * 1000).unref()
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#FAFAFA',
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
  if (app.isPackaged) {
    setupAutoUpdater()
  }
})

ipcMain.handle('update:check', () => {
  if (!app.isPackaged) return false
  return autoUpdater
    .checkForUpdates()
    .then(() => true)
    .catch(() => false)
})

ipcMain.on('update:quit-and-install', () => {
  if (app.isPackaged) {
    autoUpdater.quitAndInstall()
  }
})
