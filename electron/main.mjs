import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolveAsset(...parts) {
  const fromApp = path.join(app.getAppPath(), ...parts)
  if (fs.existsSync(fromApp)) return fromApp
  const fromDir = path.join(__dirname, '..', ...parts)
  if (fs.existsSync(fromDir)) return fromDir
  return fromApp
}

function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.ico')
    : resolveAsset('build', 'icon.ico')

  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: 'Typing Practice',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0a0e1a',
    autoHideMenuBar: true,
    center: true,
    webPreferences: {
      preload: resolveAsset('electron', 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  })

  const showWin = () => {
    if (!win.isDestroyed()) {
      win.show()
      win.focus()
    }
  }

  win.once('ready-to-show', showWin)
  setTimeout(showWin, 2500)

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    const message = `
      <html><body style="font-family:Segoe UI,sans-serif;background:#0a0e1a;color:#e8eefc;padding:2rem">
        <h1>Typing Practice failed to load</h1>
        <p><b>Code:</b> ${code}</p>
        <p><b>Error:</b> ${desc}</p>
        <p><b>URL:</b> ${url}</p>
        <p><b>App path:</b> ${app.getAppPath()}</p>
      </body></html>`
    void win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(message)}`)
    showWin()
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    void win.loadFile(resolveAsset('dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
