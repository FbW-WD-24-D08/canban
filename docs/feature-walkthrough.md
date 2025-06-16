# Feature Walkthrough: Landing Page & UI Enhancements

This document outlines the recent creative and functional amendments made to the Canban application, focusing on the landing page hero section and dynamic UI elements.

---

### 1. Dynamic Help Button

- **Objective:** The floating help button (`?`) should only be visible on dashboard-related pages.
- **Implementation:**
  - The button was located in `src/App.tsx`.
  - The `useLocation` hook from `react-router-dom` was used to track the current URL path.
  - The button is now conditionally rendered only when the `location.pathname` starts with `/dashboard`.

---

### 2. Cinematic Video Hero Section

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

### 3. Video Playback Refinements

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

### 4. Intelligent Auto-Hiding Navbar

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

This series of changes has transformed the user's initial experience into a modern, immersive, and highly polished welcome.
