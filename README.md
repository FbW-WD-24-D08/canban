# Canban - Modern Kanban Board Application

![Vercel Deploy](https://img.shields.io/badge/deployed-Vercel-000?logo=vercel)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

A modern Kanban board application for efficient project management and task organization. Built with React 19, TypeScript, and cutting-edge web technologies.

## 🚀 Features

### Core Board Management

- **Visual Project Management** – Drag-and-drop columns and cards for seamless organization
- **Done Automation** – Tasks automatically switch to `DONE` status when moved to "Done" column
- **Archive System** – Completed tickets can be archived with collapsible sections for clean organization
- **Multi-User Collaboration** – Board sharing with member management and ownership controls

### Advanced File Management & Organization System

- **Smart Folder Organization** – Automatic file categorization into Images, Documents, and Archives folders
- **Drag & Drop Interface** – Intuitive file upload with visual progress indicators and folder targeting
- **Professional File Browser** – Grid and list view modes with thumbnail generation for visual identification
- **Rich Preview Experience** – Click any attachment for instant preview with:
  - **Markdown Rendering** – GitHub Flavored Markdown with beautiful typography
  - **Image Display** – Full-screen image viewing with zoom and navigation capabilities
  - **PDF Preview** – Embedded PDF viewing with download fallback
  - **Code Syntax Highlighting** – Support for JavaScript, TypeScript, JSON, XML
  - **File Navigation** – Arrow key navigation between files with position counter
- **Advanced Search & Filtering** – Find files by name, type, size, or shared status across all folders
- **File Operations** – Download, share, delete, and move files between folders with context menus
- **Zero Database Bloat** – Smart caching temporarily stores preview data, auto-cleans after use
- **Performance Optimized** – Lazy loading, thumbnail caching, and debounced search for smooth experience

### Productivity & UX

- **Command Palette ⌘/Ctrl + K** – Quick access to board actions and navigation
- **Shortcut Overlay Shift + ?** – Comprehensive hotkey reference in elegant dialog
- **Context Menus** – Consistent Radix UI components for accessibility
- **Responsive Design** – Optimized for desktop and mobile experiences

### Authentication & Security

- **Clerk Integration** – Secure authentication with session management
- **User Profiles** – Comprehensive user management with email and username support
- **Access Control** – Permission-based features depending on user role and board ownership

### Tech Stack & Performance

- **React 19** – Latest React features for optimal performance
- **TypeScript** – Full type safety throughout the application
- **Tailwind CSS 4** – Modern styling with dark-mode optimization
- **Vite** – Lightning-fast development server and build process
- **JSON Server** – Rapid mock backend (HMR ignores DB writes for smooth development)

### Architecture

- **Atomic Design Pattern** – atoms / molecules / organisms / layouts / pages
- **Custom Hooks** – `useBoard`, `useColumns`, `useTasks`, `useBoardMembers` for state management
- **Component Reusability** – Modular design with consistent patterns
- **Type-Safe API Layer** – Comprehensive TypeScript interfaces for all data operations

## 📖 Documentation

- **[MeisterTask Clone PRD](./docs/meistertask-clone-prd.md)** – Comprehensive Product Requirements Document detailing the complete transformation plan, technical architecture, design system specifications, and implementation roadmap
- **[File Management & Folder System](./docs/file-management-folder-system.md)** – Complete guide to the advanced file organization system with folder hierarchy, drag-and-drop functionality, and professional file browser interface
- **[Tag System Implementation](./docs/tag-system-implementation.md)** – Complete documentation of the advanced tag management and filtering system implemented today, including Phase 2A & 2B achievements
- **[Design System](./docs/design-system.md)** – Comprehensive design documentation covering our dual-theme architecture, MeisterTask clone features, color palettes, component system, and accessibility guidelines
- **[Feature Walkthrough](./docs/feature-walkthrough.md)** – Detailed overview of recent enhancements including file preview system, UI improvements, and advanced functionality
- **[Recent Bugfixes](./docs/bugfixes.md)** – A summary of recent stability improvements and bugfixes
- **[Modal System Upgrade](./docs/modal-system-upgrade.md)** – Complete guide to the modern modal and toast notification system, including migration from legacy browser dialogs

![sudo rm -rfv / --no-preserve-root](./public/sudo_rm_-rf.png)

## 🛠️ Technologies

### Frontend Stack

- **React 19** - Modern UI framework with latest features
- **TypeScript 5.8** - Static typing and enhanced developer experience
- **Vite 6.3** - Next-generation build tool and dev server
- **React Router 7.6** - Declarative client-side routing

### Styling & UI Components

- **Tailwind CSS 4.1** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful & consistent icon library
- **@tailwindcss/typography** - Professional prose styling

### File & Preview System

- **react-markdown** - Markdown rendering with GitHub Flavored Markdown
- **remark-gfm** - Enhanced markdown features (tables, task lists, etc.)
- **IndexedDB Integration** - Client-side file storage capabilities
- **Smart Caching System** - Temporary database storage with auto-cleanup

### Authentication & Data

- **Clerk** - Complete user authentication and management
- **JSON Server** - Development API with file upload support
- **Custom API Client** - Type-safe fetch-based communication layer

### Development Tools

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Concurrently** - Parallel script execution for development

## 📁 Project Structure

The project follows **Atomic Design Methodology** for scalable component organization:

```
src/
├── components/
│   ├── atoms/          # Basic UI elements (buttons, inputs, etc.)
│   ├── molecules/      # Composed components (cards, dialogs, etc.)
│   ├── organisms/      # Complex UI sections (navbar, board columns, etc.)
│   ├── layouts/        # Page layouts (dashboard, default)
│   ├── pages/          # Complete pages (landing, dashboard, board views)
│   └── contexts/       # React contexts for state management
├── api/                # API client and service functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── config/             # Configuration files
├── lib/                # Utility functions and helpers
└── assets/             # Static assets
```

## 🚦 Installation & Setup

### For Windows, Linux, and macOS

```bash
# Clone the repository
git clone https://github.com/FbW-WD-24-D08/canban.git

# Navigate to project directory
cd canban

# Install dependencies
npm install

# Start development servers (API + Frontend)
npm run dev:full
```

The installation automatically sets up necessary files:

- Creates `.env` file from `example.env`
- Ensures `db` directory exists
- Initializes empty `db.json` file if needed
- Configures development environment

## 📝 Available Scripts

- `npm run dev` - Start frontend development server
- `npm run api` - Start JSON-Server backend API
- `npm run dev:full` - Start both servers concurrently
- `npm run build` - Build production version
- `npm run lint` - Run ESLint code analysis
- `npm run check` - TypeScript type checking
- `npm run preview` - Preview production build
- `npm run setup` - Initialize development environment

## 🎯 Key Features Deep Dive

### Smart File Preview System

The application features a sophisticated file management system:

1. **Upload Process**: Select files or paste external URLs
2. **Preview Generation**: Click any attachment for instant rich preview
3. **Temporary Caching**: System stores base64 data temporarily in database for fast access
4. **Auto Cleanup**: Preview data automatically removed when preview closes
5. **Format Support**: Comprehensive support for markdown, images, code files, and more

### Collaborative Workspace

- **Multi-User Boards**: Share boards with team members
- **Role-Based Access**: Owner and member permissions
- **Real-Time Updates**: Changes reflected across all connected users
- **Member Management**: Add/remove team members with email invitations

### Performance Optimizations

- **Lazy Loading**: Components and content loaded on-demand
- **Smart Caching**: Intelligent preview data management
- **Optimistic Updates**: UI updates immediately for better user experience
- **Bundle Optimization**: Code splitting and tree shaking for minimal bundle size

## 👥 Development Team

- **[Felix Fischer (Payermann)](https://github.com/payermann)** - Full-Stack Developer
- **[Kai (2701kai)](https://github.com/2701kai)** - Full-Stack Developer

## 🗺️ Roadmap

### Near Term

- **Column Drag Sorting** – Complete column reordering via drag-and-drop
- **Enhanced Context Menus** – Right-click quick actions without menu icons
- **Command Palette V2** – Advanced commands for board creation, task management, navigation

### Future Enhancements

- **Supabase Migration** – Real-time updates & enhanced authentication
- **PWA Features** – Installable app with offline capabilities and push notifications
- **Advanced File Management** – Version control, file sharing, collaborative editing
- **Analytics Dashboard** – Project insights, team productivity metrics
- **Integration APIs** – Connect with GitHub, Slack, and other productivity tools

## 📄 License

All rights reserved © 2025

---

**Built with ❤️ by the ELITA team using cutting-edge web technologies**
