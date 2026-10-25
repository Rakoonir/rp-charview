const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  load: () => ipcRenderer.invoke("data:load"),
  save: (data) => ipcRenderer.invoke("data:save", data),
  loadProfileOptions: () => ipcRenderer.invoke("profile-options:load"),
  saveProfileOptions: (options) => ipcRenderer.invoke("profile-options:save", options),
  chooseDataDirectory: () => ipcRenderer.invoke("data:choose-directory"),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  isSupportConfigured: () => ipcRenderer.invoke("support:configured"),
  sendSupportRequest: (submission) => ipcRenderer.invoke("support:submit", submission),
  checkForUpdates: () => ipcRenderer.invoke("updates:check"),
  getUpdateStatus: () => ipcRenderer.invoke("updates:status"),
  installUpdate: () => ipcRenderer.invoke("updates:install"),
  openDataFolder: () => ipcRenderer.invoke("app:open-data-folder"),
  windowControls: {
    minimize: () => ipcRenderer.invoke("window:control", "minimize"),
    maximize: () => ipcRenderer.invoke("window:control", "maximize"),
    close: () => ipcRenderer.invoke("window:control", "close"),
  },
  openSettings: () => ipcRenderer.send("settings:open"),
  onOpenSettings: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("settings:open", listener);
    return () => ipcRenderer.removeListener("settings:open", listener);
  },
  onUpdateStatus: (callback) => {
    const listener = (_event, status) => callback(status);
    ipcRenderer.on("updates:status", listener);
    return () => ipcRenderer.removeListener("updates:status", listener);
  },
});
