# Feature Walkthrough: Canban Application

This document outlines the key features and recent enhancements made to the Canban application, covering UI improvements, file management, and advanced preview capabilities.

---

## 1. Dynamic Help Button

- **Objective:** The floating help button (`?`) should only be visible on dashboard-related pages.
- **Implementation:**
  - The button was located in `src/App.tsx`.
  - The `useLocation` hook from `react-router-dom` was used to track the current URL path.
  - The button is now conditionally rendered only when the `location.pathname` starts with `/dashboard`.

---

## 2. Cinematic Video Hero Section

- **Objective:** Replace the static gradient on the homepage hero with a dynamic, fullscreen video background.
- **Implementation:**

  - The component `src/components/organisms/hero.org.tsx` was modified.
  - A `<video>` element was added, configured to `autoPlay`, `loop`, and be `muted`.
  - It's styled with TailwindCSS to cover the entire section (`object-cover`).
  - A semi-transparent black overlay (`bg-black/60`) was added over the video to ensure text readability.

- **Enhancements:**
  - **Fullscreen & Centered:** The section now uses `h-screen` and `flex` properties to fill the viewport and center the content.
  - **Full-Width Content:** The `max-w-7xl` constraint was removed from the text container to allow it to span the full screen width for a more modern look.
  - **Call to Action:** An animated "scroll down" chevron icon (`lucide-react`) was added to guide users.
  - **Layout Fix:** A wrapping `<div>` in `src/components/layouts/default.layout.tsx` was removed to allow the hero section to be truly fullscreen.

---

## 3. Video Playback Refinements

- **Objective:** Improve the user experience of the background video by smoothing its loop and adjusting its speed.
- **Implementation:**
  - **Smooth Loop:**
    - A custom CSS crossfade animation (`smooth-loop`) was added to `src/index.css`.
    - This animation fades the video out at the end and in at the beginning, hiding the jarring cut of the loop.
    - **Note:** The animation duration in `src/index.css` should be manually set to match the video file's length for a perfect effect.
  - **Slower Playback:**
    - In `hero.org.tsx`, the `useRef` and `useEffect` hooks were used to get a direct reference to the video element.
    - The `playbackRate` was set to `0.75` to give the video a more subtle, cinematic feel.

---

## 4. Intelligent Auto-Hiding Navbar

- **Objective:** On the homepage, the main navigation should disappear to provide an immersive experience, but reappear when needed.
- **Implementation:**
  - The `src/components/organisms/navbar.org.tsx` component was significantly updated.
  - **Positioning:** On the homepage (`/`), the navbar is now `position: absolute` to float over the hero section. On all other pages, it remains `sticky`.
  - **Smart Reappearance:** The navbar's visibility is controlled by:
    - **Scrolling Up:** The navbar reappears if the user scrolls up.
    - **Mouse Position:** The navbar reappears if the user's mouse enters the top 80px of the viewport.
  - This was achieved using `useState` and `useEffect` to track scroll position and listen for `scroll` and `mousemove` events.
  - CSS transitions for `transform` and `opacity` ensure the hiding and showing is smooth.

---

## 5. Responsive Viewport & Layout Fixes

- **Objective:** Solve the final responsive layout bugs which caused horizontal overflow on mobile and "letterboxing" (black bars) on desktop.
- **Problem:** The `w-screen` utility on the hero section was slightly wider than the visible viewport due to the browser's scrollbar, causing layout shifts. Previous global or wrapper-based fixes were either too aggressive (disabling all horizontal scroll) or ineffective.
- **Solution (The Definitive Fix):**
  - **Scoped Body Class:** A `useEffect` hook was added to `src/components/pages/index.page.tsx`. This hook programmatically adds a `.homepage-body-active` class to the `<body>` element when the homepage mounts and cleanly removes it upon unmounting.
  - **Targeted CSS:** A corresponding CSS rule was added to `src/index.css`. This rule targets the `.homepage-body-active` class and applies `overflow-x: hidden` only to the body.
  - **Result:** This elegant solution scopes the overflow fix exclusively to the homepage, preventing any side effects on other routes (like the dashboard) where horizontal scrolling is a feature. It resolves both the mobile overflow and desktop letterboxing issues permanently.

---

## 6. Smart File Preview System

- **Objective:** Provide rich file previews without permanently bloating the database.
- **Implementation:**

  ### 6.1 Smart Preview Caching (`src/lib/preview-cache.ts`)
  
  The preview system uses a sophisticated caching strategy:
  
  - **Temporary Storage:** When a user clicks to preview a file, the system temporarily stores the base64 data in the database's `attachment.data` field
  - **Automatic Cleanup:** When the preview closes, the base64 data is automatically removed from the database
  - **Metadata Persistence:** File metadata (name, type, URLs) remains permanently stored
  - **Performance Optimization:** Subsequent preview requests fetch fresh content to ensure accuracy

  ### 6.2 Universal File Preview Component (`src/components/molecules/universal-file-preview.comp.tsx`)
  
  Features comprehensive preview support:
  
  - **Markdown Rendering:** Uses `react-markdown` with `remark-gfm` for GitHub Flavored Markdown support
  - **Image Display:** Full-screen image viewing with zoom capabilities
  - **Code Syntax:** Proper highlighting for JavaScript, TypeScript, JSON, XML files
  - **Text Files:** Monospace display for plain text files
  - **Download Support:** Direct download links for all file types
  - **Error Handling:** Graceful fallbacks when preview is not supported

  ### 6.3 File Management in Task Dialog
  
  - **File Upload:** Support for multiple file selection
  - **External URLs:** Ability to paste links to external files (Google Drive, Dropbox, etc.)
  - **Preview on Click:** Instant preview generation when clicking any attachment
  - **Remove Files:** Delete attachments with confirmation
  - **Visual Indicators:** Clear UI showing file status and types

  ### 6.4 Database Architecture
  
  ```typescript
  interface Attachment {
    id: string;           // UUID for unique identification
    name: string;         // Original file name
    type: string;         // MIME type (e.g., "text/markdown", "image/png")
    url?: string;         // Optional URL for external links
    data?: string;        // Temporary base64 data (auto-cleaned)
  }
  ```

  ### 6.5 Key Benefits
  
  - ✅ **Rich Previews:** Markdown, images, code files with proper syntax highlighting
  - ✅ **Zero Database Bloat:** Automatic cleanup prevents permanent storage of file content
  - ✅ **External File Support:** Works with cloud storage links
  - ✅ **Performance Optimized:** Lazy loading and on-demand processing
  - ✅ **User-Friendly:** Intuitive interface with clear visual feedback
  - ✅ **Download Capability:** Always available fallback for unsupported formats

  ### 6.6 Technical Stack Integration
  
  - **React 19:** Leverages latest React features for optimal performance
  - **TypeScript:** Full type safety throughout the preview system
  - **Tailwind CSS 4:** Beautiful, responsive UI with dark theme optimization
  - **@tailwindcss/typography:** Professional prose styling for markdown content
  - **Radix UI:** Accessible dialog components for preview modals
  - **Lucide React:** Consistent iconography throughout the interface

---

## 7. Member Management & Ownership

- **User Authentication:** Integrated with Clerk for secure user management
- **Board Ownership:** Clear ownership model with owner permissions
- **Member Invitations:** Ability to add and remove board members
- **Access Control:** Permission-based features depending on user role

---

## 8. Drag & Drop Functionality

- **@dnd-kit Integration:** Modern drag-and-drop using @dnd-kit library
- **Task Movement:** Seamless task movement between columns
- **Visual Feedback:** Clear indicators during drag operations
- **Touch Support:** Mobile-friendly drag interactions

---

This series of changes has transformed the Canban application into a modern, feature-rich project management tool with sophisticated file handling capabilities while maintaining excellent performance and user experience.