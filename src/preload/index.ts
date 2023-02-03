import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openLink: (url: string) => ipcRenderer.invoke('link:openLink', url),
  openFileDir: (path: string) => ipcRenderer.invoke('file:openFileDir', path),
  openCMD: (path: string) => ipcRenderer.invoke('cmd:openCMD', path),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  operateGit: (gits, action) => ipcRenderer.invoke('task:operateGit', gits, action),
  onUpdateSwitchLog: (callback) => ipcRenderer.on('update-switch-log', callback)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.electronAPI = api
}
