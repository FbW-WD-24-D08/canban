# Canban - Modernes Kanban Board

Eine moderne Kanban-Board-Anwendung für effizientes Projektmanagement und Aufgabenverwaltung. Entwickelt mit React, TypeScript und modernen Web-Technologien.

## 🚀 Features

### Core Board

- **Visuelles Projektmanagement** – Spalten & Karten lassen sich frei per Drag-and-Drop sortieren
- **Done-Automation** – Zieht man eine Karte in die "Done"-Spalte, wechselt ihr Status automatisch auf `DONE`
- **Archive** – Erledigte Tickets können archiviert und per Collapsible-Section ein-/ausgeklappt werden

### Productivity & UX

- **Command-Palette ⌘/Ctrl + K** – Grundgerüst steht und öffnet sich bereits, weitere Commands folgen
- **Shortcut-Overlay Shift + ?** – Alle Hotkeys kompakt in einer Radix Dialog-Übersicht
- **Dropdown- & Context-Menus** – Einheitliche Radix Komponenten sorgen für saubere Accessibility

### Tech & Toolchain

- **Clerk Auth** – Sichere Anmeldung & Session-Handling
- **Tailwind CSS 4 + Radix UI** – Dark-Mode optimiertes Design-System
- **JSON-Server** – Schnelles Mock-Backend (HMR ignoriert DB-Writes, keine lästigen Reloads)
- **Vite** – Blitzschneller Dev-Server & Build (DB-Ordner aus HMR-Watch ausgeschlossen)

### Architektur

- **Atomic Design** – atoms / molecules / organisms / layouts / pages
- **TypeScript** – Strenge Typisierung & ESLint-Regeln
- **Custom Hooks** – `useBoard`, `useColumns`, `useTasks` usw.

> **Neu 2025-06-XX:** Done-Automation, Archiv-Collapsible und Command-Palette-Skeleton sind live 🚀

## 🛠️ Technologien

### Frontend

- **React 19** - UI-Framework
- **TypeScript** - Typisierte Programmierung
- **Vite** - Build-Tool und Entwicklungsserver
- **React Router** - Client-seitiges Routing

### Styling & UI

- **Tailwind CSS** - Utility-first CSS Framework
- **Radix UI** - Hochwertige UI-Komponenten
- **Lucide React** - Icon-Bibliothek
- **shadcn/ui** - UI-Komponenten-System

### Authentication & Backend

- **Clerk** - Benutzerauthentifizierung und -verwaltung

### Development Tools

- **ESLint** - Code-Linting
- **TypeScript ESLint** - TypeScript-spezifische Regeln

## 📁 Projektstruktur

Das Projekt folgt der **Atomic Design Methodology**:

```
src/
├── components/
│   ├── atoms/          # Grundlegende UI-Elemente
│   ├── molecules/      # Zusammengesetzte Komponenten
│   ├── organisms/      # Komplexe UI-Bereiche
│   ├── layouts/        # Seitenlayouts
│   └── pages/          # Vollständige Seiten
├── config/             # Konfigurationsdateien
└── lib/                # Utility-Funktionen
```

## 🚦 Installation & Start

### Für Windows und Linux/Ubuntu

```bash
# Repository klonen
git clone https://github.com/FbW-WD-24-D08/canban.git

# In das Projektverzeichnis wechseln
cd canban

# Abhängigkeiten installieren (funktioniert auf Windows und Linux)
npm install

# Entwicklungsserver starten
npm run dev:full
```

Die Installation richtet automatisch die notwendigen Dateien ein:

- Erstellt eine `.env` Datei aus `example.env`
- Stellt sicher, dass ein `db` Verzeichnis existiert
- Initialisiert eine leere `db.json` Datei, falls nötig

## 📝 Verfügbare Skripte

- `npm run dev` - Startet den Entwicklungsserver
- `npm run api` - Startet den JSON-Server für die API
- `npm run dev:full` - Startet beide Server gleichzeitig
- `npm run build` - Erstellt die Produktionsversion
- `npm run lint` - Führt ESLint-Prüfung durch
- `npm run preview` - Vorschau der Produktionsversion
- `npm run setup` - Richtet die Entwicklungsumgebung ein

## 👥 Team

- **[Payermann](https://github.com/payermann)** - Developer
- **[Kai](https://github.com/2701kai)** - Developer

## 📄 Lizenz

Alle Rechte vorbehalten © 2025

---

**[⬆️ Nach oben](#canban---modernes-kanban-board)**

## 🗺️ Roadmap

- **Column Drag-Sorting** – Komplette Spaltenreihenfolge via DnD anpassbar
- **Kontext-Menü (right-click)** – Schnellaktionen ohne Menü-Icon
- **Command-Palette V1** – Boards anlegen, Tasks erstellen, Navigation etc.
- **Supabase Migration** – Realtime Updates & Auth ⇢ ersetzt JSON-Server später
- **PWA & Offline** – Installierbar, Push-Ready, Offline Queueing
