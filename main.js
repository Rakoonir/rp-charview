const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const APP_URL = pathToFileURL(path.join(__dirname, "CharView.html")).href;
const defaults = { autoCheckUpdates: true, launchAtStartup: false };
let mainWindow;
let updateStatus = { event: "idle", message: "Noch nicht nach Updates gesucht." };

app.setAppUserModelId("de.rakoonir.rpcharview");
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function dataPath() {
  return path.join(app.getPath("userData"), "characters.json");
}

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

async function readSettings() {
  try {
    const saved = JSON.parse(await fs.readFile(settingsPath(), "utf8"));
    return {
      autoCheckUpdates: saved.autoCheckUpdates !== false,
      launchAtStartup: saved.launchAtStartup === true,
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { ...defaults };
  }
}

async function writeJsonAtomically(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

function publishUpdateStatus(event, message, details = {}) {
  updateStatus = { event, message, ...details };
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("updates:status", updateStatus);
  }
}

function sendToRenderer(channel) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel);
  }
}

function setLaunchAtStartup(enabled) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
    args: [],
  });
}

function createMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Chronik",
        submenu: [
          { label: "Einstellungen…", click: () => sendToRenderer("settings:open") },
          {
            label: "Nach Updates suchen…",
            click: () => checkForUpdates(true),
          },
          { type: "separator" },
          { role: "quit", label: "Beenden" },
        ],
      },
      { role: "editMenu" },
      {
        label: "Hilfe",
        submenu: [
          {
            label: "Projekt auf GitHub öffnen",
            click: () => shell.openExternal("https://github.com/Rakoonir/rp-charview"),
          },
        ],
      },
    ]),
  );
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: "#0d0a11",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://github.com/")) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== APP_URL) event.preventDefault();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.loadFile(path.join(__dirname, "CharView.html"));
}

async function checkForUpdates(manual = false) {
  if (!app.isPackaged) {
    publishUpdateStatus(
      "unavailable",
      "Updates sind erst in der installierten App verfügbar.",
    );
    return { available: false };
  }

  publishUpdateStatus("checking", "Suche nach Updates …");
  try {
    await autoUpdater.checkForUpdates();
    return { available: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    publishUpdateStatus("error", `Update-Prüfung fehlgeschlagen: ${message}`);
    if (manual) {
      dialog.showMessageBox(mainWindow, {
        type: "warning",
        title: "Update-Prüfung fehlgeschlagen",
        message,
      });
    }
    return { available: false, error: message };
  }
}

autoUpdater.on("checking-for-update", () =>
  publishUpdateStatus("checking", "Suche nach Updates …"),
);
autoUpdater.on("update-available", (info) =>
  publishUpdateStatus("available", `Version ${info.version} wird heruntergeladen.`, {
    version: info.version,
  }),
);
autoUpdater.on("update-not-available", (info) =>
  publishUpdateStatus("current", `Du verwendest bereits Version ${info.version}.`, {
    version: info.version,
  }),
);
autoUpdater.on("download-progress", (progress) =>
  publishUpdateStatus(
    "downloading",
    `Update wird heruntergeladen: ${Math.round(progress.percent)} %`,
    { percent: Math.round(progress.percent) },
  ),
);
autoUpdater.on("update-downloaded", (info) => {
  publishUpdateStatus(
    "downloaded",
    `Version ${info.version} ist bereit. Die App kann jetzt neu gestartet werden.`,
    { version: info.version },
  );
  if (mainWindow && !mainWindow.isDestroyed()) {
    void dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update bereit",
        message: `Version ${info.version} wurde heruntergeladen.`,
        detail: "Die App kann jetzt neu gestartet werden, um das Update zu installieren.",
        buttons: ["Jetzt neu starten", "Später"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      })
      .catch((error) => {
        publishUpdateStatus(
          "error",
          `Update-Dialog konnte nicht geöffnet werden: ${error.message}`,
        );
      });
  }
});
autoUpdater.on("error", (error) =>
  publishUpdateStatus(
    "error",
    `Update fehlgeschlagen: ${error instanceof Error ? error.message : String(error)}`,
  ),
);

ipcMain.handle("data:load", async () => {
  try {
    return JSON.parse(await fs.readFile(dataPath(), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
});

ipcMain.handle("data:save", async (_event, data) => {
  if (!Array.isArray(data)) throw new TypeError("Die Chronik muss eine Liste sein.");
  await writeJsonAtomically(dataPath(), data);
});

ipcMain.handle("settings:get", async () => {
  const settings = await readSettings();
  return {
    ...settings,
    version: app.getVersion(),
    dataDirectory: app.getPath("userData"),
    updateStatus,
  };
});

ipcMain.handle("settings:save", async (_event, settings) => {
  if (
    !settings ||
    typeof settings.autoCheckUpdates !== "boolean" ||
    typeof settings.launchAtStartup !== "boolean"
  ) {
    throw new TypeError("Ungültige Einstellungen.");
  }
  const saved = {
    autoCheckUpdates: settings.autoCheckUpdates,
    launchAtStartup: settings.launchAtStartup,
  };
  await writeJsonAtomically(settingsPath(), saved);
  setLaunchAtStartup(saved.launchAtStartup);
  return saved;
});

ipcMain.handle("updates:check", () => checkForUpdates(true));
ipcMain.handle("updates:status", () => updateStatus);
ipcMain.handle("updates:install", () => autoUpdater.quitAndInstall());
ipcMain.handle("app:open-data-folder", async () => {
  const error = await shell.openPath(app.getPath("userData"));
  if (error) throw new Error(error);
});

ipcMain.on("settings:open", () => sendToRenderer("settings:open"));

app.whenReady().then(async () => {
  createMenu();
  createWindow();
  let settings;
  try {
    settings = await readSettings();
  } catch (error) {
    publishUpdateStatus("error", "Einstellungen konnten nicht gelesen werden.");
    await dialog.showMessageBox(mainWindow, {
      type: "error",
      title: "Einstellungen konnten nicht gelesen werden",
      message: error.message,
    });
    return;
  }
  setLaunchAtStartup(settings.launchAtStartup);
  if (settings.autoCheckUpdates) {
    setTimeout(() => checkForUpdates(), 4000);
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
