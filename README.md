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
- [Support-Feedback einrichten](#support-feedback-einrichten)
- [Roadmap](#roadmap)
- [Mitwirken](#mitwirken)
- [Lizenz & Danksagung](#lizenz--danksagung)

## Features

**Heldenverwaltung**
- Charaktere anlegen, bearbeiten, ansehen und löschen
- Heldenliste mit Porträt, Volk, Klasse, Stufe und Lebensbalken sowie Suche
- Begleiter unabhängig verwalten und beliebig vielen Helden zuordnen
- Begleiter direkt im Heldenprofil aus einer Liste vorhandener Begleiter zuordnen
- Kontaktprofile pro Held mit persönlichen Informationen und einzelnen RP-Notizen führen; zentrale Übersicht aller Kontakte
- Zentrales Beziehungsnetz zwischen Helden, Begleitern und Kontakten, direkt in Profilen verwaltbar; jeder Held hat zusätzlich einen verzweigten Stammbaum mit eigenständigen Personen ohne vollständiges Profil
- Export und Import der gesamten Chronik als JSON-Datei

**Charakterblatt**
- Kopfbereich mit Medaillon (Porträt oder Wappen), Name, Titel sowie optionalen Lebenspunkt- und Mana-Balken
- Charakter-Porträt direkt im Bereich **Aussehen** anzeigen, hinzufügen, ändern und entfernen
- Lebenspunkte und Mana pro Charakter optional ein-/ausblenden; deaktivierte Werte bleiben gespeichert
- Obere Reiter: **Charakterblatt**, **Galerie**, **Tagebuch**
- Weitere Charakterblatt-Reiter: **Begleiter**, **Kontakte**, **Beziehungen** zum direkten Verwalten des gemeinsamen Netzes und **Stammbaum** mit generationenweiser Familienansicht
- Begleiter- und Kontaktprofile bieten ebenfalls einen eigenen **Beziehungen**-Bereich; Änderungen sind direkt im gemeinsamen Netzwerk sichtbar
- Seitenleiste im Charakterblatt mit gemeinsamer **Charakterübersicht** für Identität, Aussehen, Hintergrund und Beziehungen sowie **Geschichte**, **Fähigkeiten**, **Attribute** und **Wesen**
- Sechs Standardattribute mit Modifikatoren sowie eigene numerische Attribute mit Modifikator
- Standardattribute und Stufe je Held individuell ein- oder ausblenden; Werte bleiben erhalten
- Charakterblatt-Bereiche und Profilabschnitte je Held neu anordnen
- Eigene Profilfelder direkt in **Identität**, **Aussehen**, **Hintergrund**, **Wesen**, **Fähigkeiten** und **Beziehungen** ergänzen, bearbeiten und löschen; Standardfelder im jeweiligen Bereich umbenennen oder ausblenden
- Arten/Rassen, Klassen/Berufe, Gesinnungen und Geschlechter bieten verwaltbare Standard- und eigene Auswahlvorgaben

**Geschichte & Tagebuch**
- Rich-Text-Editor mit Überschriften, **fett**, *kursiv*, unterstrichen, durchgestrichen, Listen, Zitaten, Trennlinien und eingebetteten Bildern
- Eigene Leseansicht für Tagebucheinträge ohne Bedienelemente im Text, mit Blättern zum älteren und neueren Eintrag
- Begleiter besitzen eine eigene Hintergrundgeschichte und ein eigenes Tagebuch
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
- Goldfarben gestaltete Scrollbars passend zur App-Oberfläche

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
| Profilfelder eines Helden ergänzen | Held bearbeiten → Bereich wählen → **Feld hinzufügen** |
| Standard-Profilfelder anpassen | Held bearbeiten → Bereich wählen → **Anpassen** |
| Eigenes Attribut anlegen | Held bearbeiten → **Eigenes Attribut** |
| Eigene Art, Klasse, Gesinnung oder Geschlecht speichern | Beim Bearbeiten unter **Mehr → Vorgaben** als eigene Auswahlvorgabe hinzufügen |
| Begleiter verwalten | **Begleiter** in der Navigation → **Neuer Begleiter** oder Karte anklicken |
| Begleiter einem Helden zuordnen | Held öffnen → Reiter **Begleiter**; alternativ im Begleiter-Editor mehrere Helden auswählen |
| Begleiter-Profilfelder ergänzen | Begleiter bearbeiten → **Profilfeld hinzufügen** |
| Begleiter-Geschichte oder -Tagebuch pflegen | Begleiter öffnen → **Hintergrundgeschichte** oder **Tagebuch** |
| Alle Kontakte ansehen | **Kontakte** in der Navigation |
| Kontaktprofil öffnen | **Kontakte** in der Navigation oder Held öffnen → Reiter **Kontakte** → Kontaktkarte anklicken |
| RP-Kontakt festhalten | Kontaktübersicht oder heldbezogener Reiter **Kontakte** → **Kontakt hinzufügen** |
| RP-Notiz zu einer Person speichern | Kontaktprofil → **Notiz hinzufügen** |
| Chronik importieren/exportieren | Kopfzeile → **Mehr** → **Importieren** / **Exportieren** |
| Einstellungen öffnen | Kopfzeile → **Mehr** → **Einstellungen** |
| Auswahlvorgaben für Art, Klasse, Gesinnung und Geschlecht verwalten | Kopfzeile → **Mehr** → **Vorgaben** |
| Geschichte schreiben | Seitenleiste → **Geschichte** → **Bearbeiten** |
| Tagebucheintrag lesen | Reiter **Tagebuch** → **Anzeigen** |
| Bilder hinzufügen | Reiter **Galerie** → **Bilder hinzufügen** |
| Bild als Porträt setzen | Bild in der Galerie öffnen → **Als Porträt** |
| Chronik sichern | **Exportieren** (JSON) |
| Chronik wiederherstellen | **Importieren** |

**Tastatur im Editor:** `Strg+B` fett · `Strg+I` kursiv · `Strg+Z` rückgängig
**Tastatur in der Galerie:** `←` `→` blättern · `Esc` schließen

## Datenmodell

Die Chronik ist ein JSON-Array aus Helden und optionalen Begleiter-Einträgen. Kontakte liegen direkt am jeweiligen Helden; die Navigation **Kontakte** zeigt eine gemeinsame Übersicht aller Kontakte. Jedes Kontaktprofil kann persönliche Felder und eine Sammlung einzelner Notizen enthalten. Begleiter sind eigenständige Einträge und verweisen über `heroIds` auf einen oder mehrere Helden:

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
  "customStats": [{ "id": "st2", "label": "Glaube", "value": 15 }],
  "customFields": [{ "id": "pf1", "label": "Orden", "value": "Silberne Flamme" }],
  "fieldLabels": { "herkunft": "Geburtsort" },
  "hiddenFields": ["besonderheiten"],
  "lp": 68, "lpMax": 84, "mp": 22, "mpMax": 30,
  "crest": "shield",                     // Wappen-Icon
  "portrait": "data:image/jpeg;base64,…",
  "gallery": [{ "id": "g1", "src": "data:image/jpeg;…", "cap": "Am Nordtor" }],
  "diary":   [{ "id": "d1", "date": "2026-10-02", "title": "…", "html": "<p>…</p>", "text": "…" }],
  "contacts": [{
    "id": "n1", "name": "Meisterin Sylva", "relation": "Heilerin",
    "role": "Kräuterkundige", "species": "Mensch", "age": "42",
    "location": "Eisenhall", "appearance": "Kupferne Brosche",
    "personality": "Ruhig und aufmerksam", "notes": "Alte Verbündete.",
    "entries": [{ "id": "cn1", "date": "2026-10-25", "title": "Erstes Treffen", "text": "…" }]
  }]
}
```

Ein Begleiter-Eintrag verwendet `"type": "companion"` und enthält unter anderem `name`, `species`, `description`, `notes`, `portrait`, `heroIds`, `customFields`, `geschichteHtml` und `diary`. Eigene Profilfelder und Attribute werden je Profil gespeichert; umbenannte und ausgeblendete Standardfelder gelten ebenfalls nur für das jeweilige Profil.

In der installierten Windows-App wird dieses Exportformat im `settings/`-Ordner des gewählten Datenverzeichnisses aufgeteilt: `characters.json` enthält die Heldenprofile, `companions.json` die Begleiter. Galeriebilder, Tagebucheinträge und Kontaktprofile liegen einzeln als JSON-Dateien in den Unterordnern `gallery/`, `diaries/` und `contacts/`; Begleiter-Tagebucheinträge liegen in `companion-diaries/` und einzelne Kontakt-RP-Notizen unter `notes/`. Eigene Arten, Klassen/Berufe, Gesinnungen und Geschlechter sowie Umbenennungen und ausgeblendete Standardvorgaben werden über **Mehr → Vorgaben** verwaltet und im App-Einstellungsordner in `profile-options.json` gespeichert. Änderungen an Vorgaben gelten für neue Vorschläge; bereits gespeicherte Figurenwerte bleiben unverändert. Import und Export bleiben ein vollständiges gemeinsames JSON-Array. Der Browser-Fallback speichert weiterhin in IndexedDB beziehungsweise localStorage.

Die eingebauten Heldenfelder werden aus der deklarativen Konstante `SECTIONS` erzeugt. Zusätzliche Profilfelder, Umbenennungen und ausgeblendete Felder werden je Held oder Begleiter gespeichert und benötigen keine Codeänderung.

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

Die App verwendet Electron mit aktiviertem Context Isolation, deaktiviertem Node-Zugriff im Renderer und einer eingeschränkten Preload-Bridge. Charaktere und Begleiter sowie Galerie-, Tagebuch- und Kontaktdaten werden als getrennte JSON-Dateien im `settings/`-Ordner des gewählten Datenverzeichnisses gespeichert. Ältere Chronikdateien werden beim Laden in diese Struktur überführt. In den Einstellungen lässt sich der Datenordner auswählen; beim Wechsel wird die aktuelle Chronik übernommen. Enthält der Zielordner bereits Daten, kannst du zwischen diesen und den aktuellen Daten wählen; beim Ersetzen wird der vorhandene Datenordner zuvor als Sicherung kopiert.

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

## Support-Feedback einrichten

Der Support-Dialog kann Feedback, Fehlerberichte und Feature-Wünsche über einen Cloudflare Worker an Discord weiterleiten. Discord-Webhook-URLs dürfen nicht in die Desktop-App oder das Repository eingetragen werden, da Nutzer sie aus der App auslesen könnten.

1. Im Ordner `support-worker` mit `npx wrangler login` bei Cloudflare anmelden.
2. Dort `npx wrangler secret put BUG_WEBHOOK_URL` und `npx wrangler secret put WISH_WEBHOOK_URL` ausführen und jeweils einen neu erstellten Discord-Webhook eintragen.
3. Mit `npx wrangler deploy` den Worker veröffentlichen.
4. Die Worker-URL als Wert von `SUPPORT_API_URL` in `main.js` eintragen und die App neu bauen.

Der Worker begrenzt Einsendungen pro IP-Adresse auf fünf pro Stunde. Für Rückfragen können Nutzer optional eine E-Mail-Adresse, einen Discord-Namen oder beides angeben.

## Roadmap

- [ ] Würfler mit Attributs-Modifikatoren
- [ ] Fertigkeitslisten mit Übungsboni
- [ ] Vollbild-Leseansicht auch für die Geschichte
- [x] Beziehungsnetz zwischen Helden, Begleitern und Kontakten
- [x] Stammbaum mit Profilen und eigenständigen Familienmitgliedern
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
