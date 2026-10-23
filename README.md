<div align="center">

# ⚔️ Chronik der Helden

**Der Charakter-Editor für Roleplay-Helden – im Stil eines epischen Fantasy-MMORPGs.**

Lege Charaktere an, schreibe ihre Geschichte, sammle Bilder und führe ein Tagebuch – alles als übersichtliches Charakterblatt, direkt im Browser und ohne Build-Schritt.

![Status](https://img.shields.io/badge/Status-aktiv-d8a64b?style=flat-square)
![Build](https://img.shields.io/badge/Build-keiner_n%C3%B6tig-8c6425?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-HTML_%C2%B7_Tailwind_%C2%B7_Vanilla_JS-d5502f?style=flat-square)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-1f3f7d?style=flat-square)

</div>

---

## Inhalt

- [Features](#features)
- [Schnellstart](#schnellstart)
- [Bedienung](#bedienung)
- [Datenmodell](#datenmodell)
- [Architektur](#architektur)
- [Als Windows-Desktop-App](#als-windows-desktop-app)
- [Offline-Betrieb](#offline-betrieb)
- [Roadmap](#roadmap)
- [Mitwirken](#mitwirken)
- [Lizenz & Danksagung](#lizenz--danksagung)

## Features

**Heldenverwaltung**
- Charaktere anlegen, bearbeiten, ansehen und löschen
- Heldenliste mit Porträt, Volk, Klasse, Stufe und Lebensbalken sowie Suche
- Export und Import der gesamten Chronik als JSON-Datei

**Charakterblatt**
- Kopfbereich mit Medaillon (Porträt oder Wappen), Name, Titel sowie Lebenspunkt- und Mana-Balken
- Obere Reiter: **Charakterblatt**, **Galerie**, **Tagebuch**
- Seitenleiste im Charakterblatt: **Aussehen**, **Über den Charakter**, **Geschichte**, **Fähigkeiten**, **Attribute**, **Wesen**
- Sechs Attribute mit Modifikatoren, Lebenskraft, Gesinnung, Erscheinung, Herkunft, Familie, Persönlichkeit, Ideale, Bindungen, Makel, Ausrüstung, Verbündete, Feinde, Ziele und Notizen

**Geschichte & Tagebuch**
- Rich-Text-Editor mit Überschriften, **fett**, *kursiv*, unterstrichen, durchgestrichen, Listen, Zitaten, Trennlinien und eingebetteten Bildern
- Eigene Leseansicht für Tagebucheinträge ohne Bedienelemente im Text, mit Blättern zum älteren und neueren Eintrag
- Eingebauter HTML-Sanitizer: Gespeicherte und importierte Inhalte können keinen Schadcode enthalten

**Galerie & Porträt**
- Porträt-Upload sowie Bildergalerie pro Charakter mit Großansicht, Bildunterschriften und Tastaturnavigation
- Bilder werden beim Hochladen automatisch verkleinert

**Design**
- Mittelalterliches Fantasy-Design mit Goldrahmen, Wappenmedaillons und Glutakzenten
- Schriften: *Cinzel Decorative*, *Cinzel* und *Cormorant Garamond*
- Responsiv bis aufs Handy, sichtbarer Tastaturfokus, `prefers-reduced-motion` wird beachtet

## Schnellstart

Die gesamte Anwendung steckt in **einer HTML-Datei**. Es gibt keinen Build-Schritt und keine Abhängigkeiten zum Installieren.

```bash
git clone https://github.com/<dein-name>/chronik-der-helden.git
cd chronik-der-helden
```

Öffne anschließend `index.html` per Doppelklick im Browser. Alternativ startest du einen lokalen Server:

```bash
npx serve .
# oder
python -m http.server 8080
```

> **Hinweis:** Tailwind und die Google Fonts werden beim ersten Laden per CDN bezogen. Für den komplett lokalen Betrieb siehe [Offline-Betrieb](#offline-betrieb).

## Bedienung

| Aktion | So geht's |
| --- | --- |
| Neuen Helden erschaffen | **Neuer Held** oben rechts |
| Held ansehen | Karte in der Heldenliste anklicken |
| Held bearbeiten | **Bearbeiten** im Charakterblatt |
| Geschichte schreiben | Seitenleiste → **Geschichte** → **Bearbeiten** |
| Tagebucheintrag lesen | Reiter **Tagebuch** → **Anzeigen** |
| Bilder hinzufügen | Reiter **Galerie** → **Bilder hinzufügen** |
| Bild als Porträt setzen | Bild in der Galerie öffnen → **Als Porträt** |
| Chronik sichern | **Exportieren** (JSON) |
| Chronik wiederherstellen | **Importieren** |

**Tastatur im Editor:** `Strg+B` fett · `Strg+I` kursiv · `Strg+Z` rückgängig
**Tastatur in der Galerie:** `←` `→` blättern · `Esc` schließen

## Datenmodell

Die Chronik ist ein JSON-Array. Jeder Held ist ein Objekt:

```jsonc
{
  "id": "c1abc",
  "name": "Aldric Sturmwacht",
  "titel": "Wächter des Nordpasses",
  "art": "Zwerg",
  "klasse": "Paladin",
  "level": 7,
  "gesinnung": "Rechtschaffen gut",
  "geschlecht": "Männlich", "alter": "112 Winter",
  "groesse": "1,38 m", "gewicht": "92 kg",
  "augen": "Stahlgrau", "haare": "Kupferrot", "haut": "Wettergegerbt",
  "besonderheiten": "…",
  "herkunft": "…", "hintergrund": "…", "familie": "…",
  "geschichteHtml": "<p>…</p>",          // Rich-Text der Geschichte
  "persoenlichkeit": "…", "ideale": "…", "bindungen": "…", "makel": "…",
  "faehigkeiten": "…", "ausruestung": "…",
  "verbuendete": "…", "feinde": "…", "ziele": "…", "notizen": "…",
  "stats": { "st": 17, "ge": 9, "ko": 16, "in": 11, "we": 14, "ch": 13 },
  "lp": 68, "lpMax": 84, "mp": 22, "mpMax": 30,
  "crest": "shield",                     // Wappen-Icon
  "portrait": "data:image/jpeg;base64,…",
  "gallery": [{ "id": "g1", "src": "data:image/jpeg;…", "cap": "Am Nordtor" }],
  "diary":   [{ "id": "d1", "date": "2026-10-02", "title": "…", "html": "<p>…</p>", "text": "…" }]
}
```

Neue Felder lassen sich an einer Stelle ergänzen: Editor und Charakterblatt werden aus der deklarativen Konstante `SECTIONS` erzeugt.

## Architektur

Der Code ist in vier Schichten getrennt, damit er später ohne Umbau in ein Desktop-Projekt wandern kann:

```
┌──────────────────────────────────────────────┐
│ 4. ui/*        Views (Liste, Blatt, Editor,  │
│                Galerie, Tagebuch, Leseansicht)│
├──────────────────────────────────────────────┤
│ 3. core/store  Zustand + CRUD (ohne DOM)      │
├──────────────────────────────────────────────┤
│ 2. core/storage  austauschbarer Adapter       │
│    Browser: IndexedDB (Fallback localStorage) │
│    Desktop: window.desktop.load / .save       │
├──────────────────────────────────────────────┤
│ 1. core/schema Datenmodell, Felder, Konstanten│
└──────────────────────────────────────────────┘
```

Bei der Migration in ein größeres Projekt wird jeder Abschnitt in eine eigene ES-Modul-Datei ausgelagert (`schema.js`, `storage.js`, `store.js`, `ui/…`). Die Schichten kennen sich nur über ihre Schnittstellen.

**Technik:** HTML5 · [Tailwind CSS](https://tailwindcss.com) · Vanilla JavaScript · [Lucide](https://lucide.dev)-Icons (als Inline-SVG eingebettet) · Google Fonts

## Als Windows-Desktop-App

Die Anwendung erwartet optional eine Bridge `window.desktop` mit zwei Funktionen. Ist sie vorhanden, wird sie statt des Browser-Speichers verwendet:

```ts
window.desktop = {
  load: () => Promise<Held[] | null>,
  save: (daten: Held[]) => Promise<void>
}
```

### Electron

```js
// preload.js
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  load: () => ipcRenderer.invoke('chronik:load'),
  save: (data) => ipcRenderer.invoke('chronik:save', data),
});
```

```js
// main.js (Auszug)
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs/promises');
const path = require('path');
const file = () => path.join(app.getPath('userData'), 'chronik.json');

ipcMain.handle('chronik:load', async () => {
  try { return JSON.parse(await fs.readFile(file(), 'utf8')); } catch { return null; }
});
ipcMain.handle('chronik:save', (_e, data) => fs.writeFile(file(), JSON.stringify(data)));

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280, height: 860,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.loadFile('index.html');
});
```

Zum Verpacken eignen sich z. B. `electron-builder` oder `electron-forge`.

### Tauri

Mit `withGlobalTauri` kannst du die Bridge im Frontend setzen und die Dateizugriffe in Rust-Commands ablegen:

```js
const { invoke } = window.__TAURI__.core;
window.desktop = {
  load: () => invoke('load_chronik'),
  save: (data) => invoke('save_chronik', { data }),
};
```

## Offline-Betrieb

Für eine App ohne Internetzugriff:

1. **Tailwind:** Das CDN-Skript durch ein gebautes Stylesheet ersetzen (`npx tailwindcss -i … -o styles.css`).
2. **Schriften:** *Cinzel*, *Cinzel Decorative* und *Cormorant Garamond* herunterladen und per `@font-face` einbinden.
3. Die Icons sind bereits eingebettet, hier ist nichts zu tun.

## Roadmap

- [ ] Würfler mit Attributs-Modifikatoren
- [ ] Fertigkeitslisten mit Übungsboni
- [ ] Vollbild-Leseansicht auch für die Geschichte
- [ ] Beziehungen zwischen Charakteren
- [ ] Druck- und PDF-Ansicht des Charakterblatts
- [ ] Mehrere Chroniken (Kampagnen)
- [ ] Aufteilung in ES-Module und Vite-Build

Ideen und Wünsche sind als [Issue](../../issues) willkommen.

## Mitwirken

Beiträge sind gern gesehen.

1. Repository forken
2. Branch anlegen: `git checkout -b feature/mein-feature`
3. Änderungen committen: `git commit -m "Beschreibung"`
4. Branch pushen und einen Pull Request öffnen

Bitte halte dich an die vorhandene Schichtentrennung (Schema, Storage, Store, UI) und füge keine Abhängigkeiten hinzu, die einen Build-Schritt erzwingen.

## Lizenz & Danksagung

Veröffentlicht unter der [MIT-Lizenz](LICENSE).

- Icons: [Lucide](https://lucide.dev) (ISC-Lizenz)
- Schriften: Cinzel, Cinzel Decorative und Cormorant Garamond (SIL Open Font License) über Google Fonts
- Styling: [Tailwind CSS](https://tailwindcss.com) (MIT-Lizenz)
