# Canban - Modernes Kanban Board

Eine moderne Kanban-Board-Anwendung für effizientes Projektmanagement und Aufgabenverwaltung. Entwickelt mit React, TypeScript und modernen Web-Technologien.

## 🚀 Features

- **Visuelles Projektmanagement**: Intuitive Kanban-Board-Oberfläche
- **Benutzerauthentifizierung**: Sichere Anmeldung mit Clerk Auth
- **Responsive Design**: Optimiert für Desktop und mobile Geräte
- **Moderne UI**: Dunkles Theme mit Tailwind CSS
- **Atomic Design**: Strukturierte Komponentenarchitektur
- **Cross-Platform**: Funktioniert auf Windows und Linux/Ubuntu

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

- **[Kai](https://github.com/2701kai)** - Developer
- **[Payermann](https://github.com/payermann)** - Developer

## 📄 Lizenz

Alle Rechte vorbehalten © 2025

---

**[⬆️ Nach oben](#canban---modernes-kanban-board)**
