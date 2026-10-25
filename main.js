const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const APP_URL = pathToFileURL(path.join(__dirname, "CharView.html")).href;
const SUPPORT_API_URL = "https://rp-charview-support.kjano-privat.workers.dev";
const defaultTheme = {
  preset: "royal-dark",
  background: "#0d0a11",
  background2: "#1a121d",
  panel: "#211826",
  ink: "#ecdfc4",
  muted: "#a89a82",
  accent: "#d8a64b",
  accent2: "#8c6425",
  ember: "#d5502f",
  line: "rgba(216, 166, 75, 0.35)",
  glow: "rgba(213, 80, 47, 0.45)",
  glowSoft: "rgba(142, 202, 230, 0.18)",
  buttonTop: "#3a2a2f",
  buttonBottom: "#1d1419",
  buttonText: "#f8f1dc",
  fontTheme: "classic",
  highlight: "#fff2c4",
  panelStrong: "#3a1f2c",
  portraitGlow: "#4a2433",
  fieldSurface: "rgba(255, 255, 255, 0.02)",
  modalBackdrop: "rgba(8, 5, 10, 0.93)",
  cardGlow: "rgba(216, 166, 75, 0.06)",
};
const defaults = {
  autoCheckUpdates: true,
  launchAtStartup: false,
  theme: { ...defaultTheme },
};
let mainWindow;
let updateStatus = { event: "idle", message: "Noch nicht nach Updates gesucht." };

app.setAppUserModelId("de.rakoonir.rpcharview");
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function settingsDirectoryFor(directory = app.getPath("userData")) {
  return path.join(directory, "settings");
}

function settingsPath(directory = app.getPath("userData")) {
  return path.join(settingsDirectoryFor(directory), "settings.json");
}

function legacySettingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

const COLLECTION_DIRECTORIES = ["companion-diaries", "contacts", "diaries", "gallery", "notes"];
const cloneWithout = (value, keys) => {
  const copy = { ...value };
  keys.forEach((key) => delete copy[key]);
  return copy;
};
const storageKey = (id) => Buffer.from(String(id), "utf8").toString("hex") || "empty";

function recordId(record, collection) {
  if (!record || (typeof record.id !== "string" && typeof record.id !== "number") || !String(record.id)) {
    throw new TypeError(`Ein Eintrag in „${collection}“ benötigt eine gültige ID.`);
  }
  return String(record.id);
}

async function readJsonRecords(directory) {
  const records = [];
  async function visit(currentDirectory) {
    let entries;
    try {
      entries = await fs.readdir(currentDirectory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const filePath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) await visit(filePath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        const record = JSON.parse(await fs.readFile(filePath, "utf8"));
        if (!record || typeof record !== "object" || Array.isArray(record)) {
          throw new TypeError(`Ungültiger Datensatz in ${filePath}`);
        }
        records.push(record);
      }
    }
  }
  await visit(directory);
  return records;
}

async function collectJsonPaths(directory) {
  const paths = [];
  async function visit(currentDirectory) {
    let entries;
    try {
      entries = await fs.readdir(currentDirectory, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const filePath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) await visit(filePath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) paths.push(filePath);
    }
  }
  await visit(directory);
  return paths;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function mergeById(...collections) {
  const merged = new Map();
  for (const collection of collections) {
    for (const entry of collection || []) {
      if (entry && (typeof entry.id === "string" || typeof entry.id === "number")) {
        merged.set(String(entry.id), entry);
      }
    }
  }
  return [...merged.values()];
}

async function readChronicleStore(storeDirectory, legacyDirectory = null) {
  const charactersPath = path.join(storeDirectory, "characters.json");
  let characters = await readChronicle(charactersPath);
  let legacySource = false;
  if (characters === null && legacyDirectory) {
    const legacyPath = path.join(legacyDirectory, "characters.json");
    characters = await readChronicle(legacyPath);
    legacySource = characters !== null;
  }

  const companionsPath = path.join(storeDirectory, "companions.json");
  const savedCompanions = await readChronicle(companionsPath);
  const [galleryRecords, diaryRecords, companionDiaryRecords, contactRecords, noteRecords] = await Promise.all([
    readJsonRecords(path.join(storeDirectory, "gallery")),
    readJsonRecords(path.join(storeDirectory, "diaries")),
    readJsonRecords(path.join(storeDirectory, "companion-diaries")),
    readJsonRecords(path.join(storeDirectory, "contacts")),
    readJsonRecords(path.join(storeDirectory, "notes")),
  ]);
  const allRecordsExist = characters !== null || savedCompanions !== null ||
    galleryRecords.length > 0 || diaryRecords.length > 0 || companionDiaryRecords.length > 0 ||
    contactRecords.length > 0 || noteRecords.length > 0;
  if (!allRecordsExist) return { data: null, hasData: false, needsMigration: false };
  if (savedCompanions !== null && !Array.isArray(savedCompanions)) {
    throw new TypeError(`Die Begleiter-Datei ist ungültig: ${companionsPath}`);
  }

  const sourceEntries = characters || [];
  const heroes = sourceEntries.filter((entry) =>
    entry?.type !== "companion" && entry?.type !== "chronicle-network",
  );
  const network = sourceEntries.find((entry) => entry?.type === "chronicle-network");
  const legacyCompanions = sourceEntries.filter((entry) => entry?.type === "companion");
  const companions = mergeById(legacyCompanions, savedCompanions || []).map((companion) => {
    const legacyCompanion = legacyCompanions.find((entry) => String(entry.id) === String(companion.id));
    return legacyCompanion?.diary?.length
      ? { ...companion, diary: mergeById(legacyCompanion.diary, companion.diary || []) }
      : companion;
  });
  const groupByHero = (records) => {
    const grouped = new Map();
    for (const record of records) {
      if (record.heroId === undefined || record.heroId === null) continue;
      const key = String(record.heroId);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(cloneWithout(record, ["heroId", "contactId"]));
    }
    return grouped;
  };
  const galleriesByHero = groupByHero(galleryRecords);
  const diariesByHero = groupByHero(diaryRecords);
  const diariesByCompanion = new Map();
  for (const record of companionDiaryRecords) {
    if (record.ownerId == null) continue;
    const key = String(record.ownerId);
    if (!diariesByCompanion.has(key)) diariesByCompanion.set(key, []);
    diariesByCompanion.get(key).push(cloneWithout(record, ["ownerId", "ownerType"]));
  }
  const contactsByHero = groupByHero(contactRecords);
  const notesByContact = new Map();
  for (const record of noteRecords) {
    if (record.heroId == null || record.contactId == null) continue;
    const key = `${record.heroId}\0${record.contactId}`;
    if (!notesByContact.has(key)) notesByContact.set(key, []);
    notesByContact.get(key).push(cloneWithout(record, ["heroId", "contactId"]));
  }

  const embeddedCollections = heroes.some((hero) =>
    ["gallery", "diary", "contacts"].some((key) => Array.isArray(hero[key]) && hero[key].length > 0),
  );
  const embeddedCompanionDiaries = companions.some((companion) =>
    Array.isArray(companion.diary) && companion.diary.length > 0,
  );
  for (const hero of heroes) {
    const heroId = String(hero.id);
    hero.gallery = mergeById(hero.gallery || [], galleriesByHero.get(heroId) || []);
    hero.diary = mergeById(hero.diary || [], diariesByHero.get(heroId) || []);
    const externalContacts = contactsByHero.get(heroId) || [];
    hero.contacts = mergeById(hero.contacts || [], externalContacts).map((contact) => {
      const savedNotes = notesByContact.get(`${heroId}\0${contact.id}`) || [];
      return {
        ...contact,
        entries: mergeById(contact.entries || [], savedNotes),
      };
    });
  }
  for (const companion of companions) {
    companion.diary = mergeById(
      companion.diary || [],
      diariesByCompanion.get(String(companion.id)) || [],
    );
  }

  return {
    data: [...heroes, ...companions, ...(network ? [network] : [])],
    hasData: true,
    needsMigration:
      legacySource ||
      savedCompanions === null ||
      legacyCompanions.length > 0 ||
      embeddedCollections ||
      embeddedCompanionDiaries ||
      !await fileExists(charactersPath),
  };
}

async function saveChronicleStore(storeDirectory, data) {
  if (!Array.isArray(data)) throw new TypeError("Die Chronik muss eine Liste sein.");
  const heroes = data.filter((entry) =>
    entry?.type !== "companion" && entry?.type !== "chronicle-network",
  );
  const companions = data.filter((entry) => entry?.type === "companion");
  const network = data.filter((entry) => entry?.type === "chronicle-network");
  const files = new Map();
  files.set(path.join(storeDirectory, "characters.json"), [
    ...heroes.map((hero) => {
      recordId(hero, "characters");
      return cloneWithout(hero, ["gallery", "diary", "contacts"]);
    }),
    ...network,
  ]);
  files.set(path.join(storeDirectory, "companions.json"), companions.map((companion) => {
    recordId(companion, "companions");
    return cloneWithout(companion, ["diary"]);
  }));

  const addRecord = (collection, relativeDirectory, hero, record, extra = {}) => {
    const heroId = recordId(hero, "characters");
    const itemId = recordId(record, collection);
    const segments = [storageKey(heroId)];
    if (extra.contactId !== undefined) segments.push(storageKey(extra.contactId));
    segments.push(`${storageKey(itemId)}.json`);
    files.set(
      path.join(storeDirectory, relativeDirectory, ...segments),
      { ...record, heroId, ...(extra.contactId === undefined ? {} : { contactId: String(extra.contactId) }) },
    );
  };
  for (const hero of heroes) {
    recordId(hero, "characters");
    for (const item of hero.gallery || []) addRecord("gallery", "gallery", hero, item);
    for (const item of hero.diary || []) addRecord("diaries", "diaries", hero, item);
    for (const contact of hero.contacts || []) {
      const contactId = recordId(contact, "contacts");
      addRecord("contacts", "contacts", hero, cloneWithout(contact, ["entries"]), {});
      for (const note of contact.entries || []) {
        addRecord("notes", "notes", hero, note, { contactId });
      }
    }
  }
  for (const companion of companions) {
    const companionId = recordId(companion, "companions");
    for (const item of companion.diary || []) {
      const itemId = recordId(item, "companion diaries");
      files.set(
        path.join(storeDirectory, "companion-diaries", storageKey(companionId), `${storageKey(itemId)}.json`),
        { ...item, ownerId: companionId, ownerType: "companion" },
      );
    }
  }

  await Promise.all([...files].map(([filePath, value]) => writeJsonAtomically(filePath, value)));
  const expected = new Set(files.keys());
  for (const directory of COLLECTION_DIRECTORIES) {
    const collectionRoot = path.join(storeDirectory, directory);
    const existing = await collectJsonPaths(collectionRoot);
    await Promise.all(existing.filter((filePath) => !expected.has(filePath)).map((filePath) => fs.rm(filePath)));
  }
}

function normalizeTheme(theme) {
  const base = { ...defaultTheme };
  if (!theme || typeof theme !== "object") return base;
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(base).map(([key]) => [key, typeof theme[key] === "string" ? theme[key] : base[key]]),
    ),
  };
}

async function readSettings() {
  const defaultDataDirectory = app.getPath("userData");
  const legacyPath = legacySettingsPath();
  const primaryPath = settingsPath(defaultDataDirectory);
  const fallbackPaths = [primaryPath, legacyPath];

  let saved = null;
  let sourcePath = null;

  for (const candidate of fallbackPaths) {
    try {
      saved = JSON.parse(await fs.readFile(candidate, "utf8"));
      sourcePath = candidate;
      break;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  if (!saved) {
    return {
      ...defaults,
      dataDirectory: defaultDataDirectory,
      theme: { ...defaultTheme },
    };
  }

  const dataDirectory =
    typeof saved.dataDirectory === "string" && path.isAbsolute(saved.dataDirectory)
      ? saved.dataDirectory
      : defaultDataDirectory;
  const targetPath = settingsPath(dataDirectory);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  if (sourcePath !== targetPath) {
    await writeJsonAtomically(targetPath, saved);
    if (sourcePath === legacyPath) {
      await fs.rm(legacyPath, { force: true });
    }
  }

  return {
    autoCheckUpdates: saved.autoCheckUpdates !== false,
    launchAtStartup: saved.launchAtStartup === true,
    dataDirectory,
    theme: normalizeTheme(saved.theme),
  };
}

async function readChronicle(filePath) {
  try {
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));
    if (!Array.isArray(data)) {
      throw new TypeError(`Die Chronik-Datei ist ungültig: ${filePath}`);
    }
    return data;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 680,
    frame: false,
    backgroundColor: "#0d0a11",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://github.com/") || url === "mailto:mail@rakoonir.me") {
      shell.openExternal(url);
    }
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
  const settings = await readSettings();
  const storeDirectory = settingsDirectoryFor(settings.dataDirectory);
  const chronicle = await readChronicleStore(storeDirectory, settings.dataDirectory);
  if (!chronicle.hasData) return null;
  if (chronicle.needsMigration) {
    await saveChronicleStore(storeDirectory, chronicle.data);
    const legacyPath = path.join(settings.dataDirectory, "characters.json");
    if (legacyPath !== path.join(storeDirectory, "characters.json")) {
      await fs.rm(legacyPath, { force: true });
    }
  }
  return chronicle.data;
});

ipcMain.handle("data:save", async (_event, data) => {
  const settings = await readSettings();
  const storeDirectory = settingsDirectoryFor(settings.dataDirectory);
  const legacyPath = path.join(settings.dataDirectory, "characters.json");
  await saveChronicleStore(storeDirectory, data);
  if (legacyPath !== path.join(storeDirectory, "characters.json")) {
    await fs.rm(legacyPath, { force: true });
  }
});

const PROFILE_OPTION_KEYS = ["arten", "klassen", "gesinnungen", "geschlechter"];

ipcMain.handle("profile-options:load", async () => {
  const filePath = path.join(settingsDirectoryFor(), "profile-options.json");
  try {
    const options = JSON.parse(await fs.readFile(filePath, "utf8"));
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(`Profiloptionen sind ungültig: ${filePath}`);
    }
    const standard = options.standard && typeof options.standard === "object" && !Array.isArray(options.standard)
      ? options.standard
      : {};
    return {
      ...Object.fromEntries(PROFILE_OPTION_KEYS.map((key) => [
        key,
        Array.isArray(options[key]) ? options[key].filter((value) => typeof value === "string") : [],
      ])),
      standard: Object.fromEntries(PROFILE_OPTION_KEYS.map((key) => [
        key,
        standard[key] && typeof standard[key] === "object" && !Array.isArray(standard[key]) ? standard[key] : {},
      ])),
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        ...Object.fromEntries(PROFILE_OPTION_KEYS.map((key) => [key, []])),
        standard: Object.fromEntries(PROFILE_OPTION_KEYS.map((key) => [key, {}])),
      };
    }
    throw error;
  }
});

ipcMain.handle("profile-options:save", async (_event, options) => {
  if (
    !options ||
    PROFILE_OPTION_KEYS.some((key) => !Array.isArray(options[key])) ||
    PROFILE_OPTION_KEYS.flatMap((key) => options[key]).some((value) => typeof value !== "string")
  ) {
    throw new TypeError("Ungültige Profiloptionen.");
  }
  const standard = options.standard ?? {};
  if (!standard || typeof standard !== "object" || Array.isArray(standard)) {
    throw new TypeError("Ungültige Standardvorgaben.");
  }
  for (const key of PROFILE_OPTION_KEYS) {
    const overrides = standard[key] ?? {};
    if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
      throw new TypeError("Ungültige Standardvorgaben.");
    }
    for (const override of Object.values(overrides)) {
      if (
        !override ||
        typeof override !== "object" ||
        Array.isArray(override) ||
        (override.label !== undefined && typeof override.label !== "string") ||
        (override.hidden !== undefined && typeof override.hidden !== "boolean")
      ) {
        throw new TypeError("Ungültige Standardvorgaben.");
      }
    }
  }
  await writeJsonAtomically(
    path.join(settingsDirectoryFor(), "profile-options.json"),
    {
      ...Object.fromEntries(PROFILE_OPTION_KEYS.map((key) => [
        key,
        [...new Set(options[key].map((value) => value.trim()).filter(Boolean))],
      ])),
      standard: Object.fromEntries(PROFILE_OPTION_KEYS.map((key) => [key, standard[key] ?? {}])),
    },
  );
});

ipcMain.handle("settings:get", async () => {
  const settings = await readSettings();
  return {
    ...settings,
    version: app.getVersion(),
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
  const currentSettings = await readSettings();
  const theme = normalizeTheme(settings.theme);
  const saved = {
    autoCheckUpdates: settings.autoCheckUpdates,
    launchAtStartup: settings.launchAtStartup,
    dataDirectory: currentSettings.dataDirectory,
    theme,
  };
  await writeJsonAtomically(settingsPath(currentSettings.dataDirectory), saved);
  setLaunchAtStartup(saved.launchAtStartup);
  return saved;
});

ipcMain.handle("support:configured", () => Boolean(SUPPORT_API_URL));

ipcMain.handle("support:submit", async (event, submission) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    throw new Error("Ungültige Support-Anfrage.");
  }
  if (!SUPPORT_API_URL) {
    throw new Error("Der Feedbackversand ist noch nicht eingerichtet.");
  }
  const endpoint = new URL(SUPPORT_API_URL);
  if (endpoint.protocol !== "https:") {
    throw new Error("Der Support-Endpunkt muss HTTPS verwenden.");
  }
  const categories = new Set(["feedback", "bug", "wish"]);
  if (
    !submission ||
    typeof submission !== "object" ||
    !categories.has(submission.category) ||
    typeof submission.title !== "string" ||
    typeof submission.message !== "string" ||
    (submission.email !== undefined && typeof submission.email !== "string") ||
    (submission.discordName !== undefined && typeof submission.discordName !== "string") ||
    (submission.contact !== undefined && typeof submission.contact !== "string")
  ) {
    throw new TypeError("Ungültige Support-Nachricht.");
  }
  const payload = {
    category: submission.category,
    title: submission.title.trim(),
    message: submission.message.trim(),
    email: submission.email?.trim() || "",
    discordName: submission.discordName?.trim() || "",
    contact: submission.contact?.trim() || "",
  };
  if (
    payload.title.length < 1 ||
    payload.title.length > 120 ||
    payload.message.length < 1 ||
    payload.message.length > 3000 ||
    payload.email.length > 200 ||
    payload.discordName.length > 100 ||
    payload.contact.length > 200
  ) {
    throw new TypeError("Bitte prüfe Betreff, Nachricht und Kontaktangabe.");
  }
  const response = await fetch(SUPPORT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Feedback konnte nicht gesendet werden (HTTP ${response.status}).`);
  }
});

ipcMain.handle("data:choose-directory", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Ordner für die Chronik auswählen",
    buttonLabel: "Diesen Ordner verwenden",
    properties: ["openDirectory", "createDirectory"],
  });
  if (canceled || !filePaths[0]) return { canceled: true };

  const destinationDirectory = path.resolve(filePaths[0]);
  const settings = await readSettings();
  const currentDirectory = path.resolve(settings.dataDirectory);
  if (
    process.platform === "win32"
      ? destinationDirectory.toLowerCase() === currentDirectory.toLowerCase()
      : destinationDirectory === currentDirectory
  ) {
    return {
      canceled: false,
      changed: false,
      directory: destinationDirectory,
    };
  }

  await fs.mkdir(destinationDirectory, { recursive: true });
  const currentStoreDirectory = settingsDirectoryFor(currentDirectory);
  const destinationStoreDirectory = settingsDirectoryFor(destinationDirectory);
  const [currentChronicle, destinationChronicle] = await Promise.all([
    readChronicleStore(currentStoreDirectory, currentDirectory),
    readChronicleStore(destinationStoreDirectory, destinationDirectory),
  ]);
  let useDestinationChronicle = false;

  if (destinationChronicle.hasData) {
    const hasCurrentChronicle = currentChronicle.hasData;
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: "question",
      title: "Chronik im Zielordner gefunden",
      message: hasCurrentChronicle
        ? "Der ausgewählte Ordner enthält bereits eine Chronik. Welche Daten möchtest du verwenden?"
        : "Der ausgewählte Ordner enthält bereits Chronikdaten. Möchtest du diese verwenden?",
      detail: hasCurrentChronicle
        ? "Beim Übernehmen der aktuellen Chronik wird der vorhandene Datenordner zuvor vollständig als Sicherung kopiert."
        : "Die Daten im bisherigen Ordner bleiben unverändert.",
      buttons: hasCurrentChronicle
        ? ["Abbrechen", "Vorhandene Chronik verwenden", "Aktuelle Chronik übernehmen"]
        : ["Abbrechen", "Vorhandene Chronik verwenden"],
      defaultId: 0,
      cancelId: 0,
    });
    if (response === 0) return { canceled: true };
    useDestinationChronicle = response === 1;
  }

  if (!useDestinationChronicle && currentChronicle.hasData) {
    if (destinationChronicle.hasData) {
      const backupPath = path.join(
        destinationDirectory,
        `chronik-backup-${new Date().toISOString().replace(/[:.]/g, "-")}`,
      );
      await fs.mkdir(backupPath, { recursive: true });
      if (await fileExists(destinationStoreDirectory)) {
        await fs.cp(destinationStoreDirectory, path.join(backupPath, "settings"), {
          recursive: true,
          errorOnExist: true,
        });
      }
      const legacyPath = path.join(destinationDirectory, "characters.json");
      if (await fileExists(legacyPath)) {
        await fs.copyFile(legacyPath, path.join(backupPath, "characters.json"));
      }
    }
    await saveChronicleStore(destinationStoreDirectory, currentChronicle.data);
  } else if (useDestinationChronicle) {
    await saveChronicleStore(destinationStoreDirectory, destinationChronicle.data);
  } else {
    await saveChronicleStore(destinationStoreDirectory, []);
  }
  const destinationLegacyPath = path.join(destinationDirectory, "characters.json");
  if (destinationLegacyPath !== path.join(destinationStoreDirectory, "characters.json")) {
    await fs.rm(destinationLegacyPath, { force: true });
  }

  const updatedSettings = {
    ...settings,
    dataDirectory: destinationDirectory,
  };
  await writeJsonAtomically(settingsPath(destinationDirectory), updatedSettings);
  return {
    canceled: false,
    changed: true,
    directory: destinationDirectory,
  };
});

ipcMain.handle("updates:check", () => checkForUpdates(true));
ipcMain.handle("updates:status", () => updateStatus);
ipcMain.handle("updates:install", () => autoUpdater.quitAndInstall());
ipcMain.handle("app:open-data-folder", async () => {
  const settings = await readSettings();
  const folder = settingsDirectoryFor(settings.dataDirectory);
  await fs.mkdir(folder, { recursive: true });
  const error = await shell.openPath(folder);
  if (error) throw new Error(error);
});

ipcMain.on("settings:open", () => sendToRenderer("settings:open"));
ipcMain.handle("window:control", (_event, action) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  switch (action) {
    case "minimize":
      mainWindow.minimize();
      break;
    case "maximize":
      if (mainWindow.isMaximized()) mainWindow.restore();
      else mainWindow.maximize();
      break;
    case "close":
      mainWindow.close();
      break;
    default:
      break;
  }
});

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
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
