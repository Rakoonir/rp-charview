<div align="center">

<img width="256" height="256" alt="Goldene Schriftrollen-Quillenkreuzung am Wappen" src="https://github.com/user-attachments/assets/223ef293-5670-4d2e-bd49-ee48e93c8f5f" />



# ⚔️ Chronik der Helden

**Der Charakter-Editor für Roleplay-Helden – im Stil eines epischen Fantasy-MMORPGs.**

Lege Charaktere an, schreibe ihre Geschichte, sammle Bilder und führe ein Tagebuch – als Windows-Desktop-App mit lokal gespeicherten Daten und automatischen Updates.

![Status](https://img.shields.io/badge/Status-aktiv-d8a64b?style=flat-square)
![Build](https://img.shields.io/badge/Build-Electron_%C2%B7_NSIS_%C2%B7_MSI-8c6425?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-Electron_%C2%B7_Tailwind_%C2%B7_Vanilla_JS-d5502f?style=flat-square)
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

**Windows-App**
- Lokale Chronik-Datei im Windows-Benutzerprofil und weiterhin JSON-Import/-Export
- Einstellungsmenü mit Update-Prüfung, automatischer Suche und Windows-Autostart
- Updates werden aus GitHub Releases geladen; Installation erfolgt nach Bestätigung mit Neustart

**Design**
- Mittelalterliches Fantasy-Design mit Goldrahmen, Wappenmedaillons und Glutakzenten
- Schriften: *Cinzel Decorative*, *Cinzel* und *Cormorant Garamond*
- Responsiv bis aufs Handy, sichtbarer Tastaturfokus, `prefers-reduced-motion` wird beachtet

## Schnellstart

Voraussetzung: Node.js 22 oder neuer.

```powershell
npm ci
npm start
```

Den Windows-Installer (NSIS-`.exe` und `.msi`) baust du mit:

```powershell
npm run build:win
```

Beide Installer und das Update-Manifest liegen anschließend unter `%TEMP%\rp-charview-build`.

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

Die HTML-Datei enthält Schema, Store und UI; `main.js` und `preload.js` ergänzen den Windows-Dateispeicher und die Update-Bridge. Die bestehende Browser-Speicherung bleibt als Fallback erhalten.

**Technik:** HTML5 · [Tailwind CSS](https://tailwindcss.com) · Vanilla JavaScript · Electron · electron-updater · lokale [Fontsource](https://fontsource.org/)-Schriften · [Lucide](https://lucide.dev)-Icons (als Inline-SVG eingebettet)

## Als Windows-Desktop-App

Die App verwendet Electron mit aktiviertem Context Isolation, deaktiviertem Node-Zugriff im Renderer und einer eingeschränkten Preload-Bridge. Charaktere liegen im Electron-Benutzerverzeichnis (`app.getPath("userData")`); der genaue Ort wird in den Einstellungen angezeigt.

### Entwicklung und Installer

```powershell
npm ci
npm start
npm run build:win
```

### Updates veröffentlichen

Ein Push eines Versions-Tags (`v*`) startet `.github/workflows/release-windows.yml`. GitHub Actions erstellt x64-NSIS- und MSI-Installer und lädt beide Installer, die NSIS-Blockmap und `latest.yml` explizit als GitHub-Release-Assets hoch. Der Workflow prüft die Version und bricht ab, wenn Dateien fehlen. Er nutzt dafür `GITHUB_TOKEN`; ein privater Deploy-Key wird nicht benötigt.

```powershell
npm version 1.0.3 --no-git-tag-version
git add package.json package-lock.json
git commit -m "Release v1.0.3"
git tag v1.0.3
git push origin main
git push origin v1.0.3
```

Die App sucht standardmäßig beim Start nach Updates, lädt sie automatisch herunter und fragt vor dem Neustart zur Installation. Update-Prüfung und Windows-Autostart sind im Einstellungsmenü konfigurierbar. Unsignierte Windows-Builds können beim ersten Start eine SmartScreen-Warnung anzeigen.

## Offline-Betrieb

Oberflächen-Styles und Schriften werden lokal mit der App ausgeliefert; für Charakterverwaltung, Galerie, Tagebuch und Import/Export ist keine Internetverbindung nötig. Nur die Update-Prüfung benötigt Internetzugriff.

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

Bitte halte dich an die vorhandene Schichtentrennung (Schema, Storage, Store, UI). Halte Laufzeit-Abhängigkeiten auf das Nötigste beschränkt; Build-Werkzeuge gehören in `devDependencies`.

## Lizenz & Danksagung

Veröffentlicht unter der [MIT-Lizenz](LICENSE).

- Icons: [Lucide](https://lucide.dev) (ISC-Lizenz)
- Schriften: Cinzel, Cinzel Decorative und Cormorant Garamond (SIL Open Font License) über Fontsource
- Styling: [Tailwind CSS](https://tailwindcss.com) (MIT-Lizenz)
