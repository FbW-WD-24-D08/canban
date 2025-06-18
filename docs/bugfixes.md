# Recent Bugfixes & Stability Improvements

![Heute mal frei?](../public/Heute-mal-frei.webp)

This document outlines key bugfixes and stability improvements recently applied to the Canban application.

---

## 1. Responsive Layout Overflow Fix

- **Problem:** On mobile devices, certain pages exhibited horizontal overflow, causing a disruptive user experience. On desktops, this could cause "letterboxing".
- **Root Cause:** The `w-screen` utility class on some full-width components was slightly wider than the visible viewport due to scrollbars.
- **Solution:** Implemented a targeted CSS fix by programmatically adding a class to the `<body>` on specific pages (`index.page.tsx`). This new class, `.homepage-body-active`, applies `overflow-x: hidden` only where needed, preventing side-effects on other parts of the application, like the dashboard, where horizontal scrolling is a feature.

## 2. Video Background Loop Smoothing

- **Problem:** The homepage's background video had a noticeable "jump" or "cut" when it looped.
- **Solution:** A custom CSS crossfade animation (`smooth-loop`) has been added. This animation fades the video in and out at the start and end of its loop, creating a seamless and more professional-looking playback experience. After loads of fun, we opted for a more conservative option with a pixel animation. You can see the <br> **[full story@vercel](https://canban-felix-fsk8s52f3-2701kais-projects.vercel.app/)** <br>of our video adventures.

![A proud gardener tending to his code](../public/gardener.webp)

## 3. Navbar Visibility on Scroll

- **Problem:** The auto-hiding navbar on the homepage was not reappearing reliably under all conditions.
- **Solution:** The logic in `navbar.org.tsx` has been refined. The navbar now correctly and smoothly reappears when the user scrolls up or when the mouse cursor enters the top portion of the viewport, ensuring it is both immersive and accessible.

## 4. Database Cleanup for File Previews

- **Problem:** The smart file preview system could, in some edge cases, leave temporary preview data in the database.
- **Solution:** The cleanup mechanism in `src/lib/preview-cache.ts` has been hardened. The system now more reliably removes the `base64` data from the `attachment.data` field after a preview is closed, ensuring zero long-term database bloat.

## 5. Major Manual Database & Auth Cleanup

- **The Challenge:** After initial setup and testing, the user database (`db/db.json`) contained redundant, test, and incorrectly configured user accounts created both manually and through Clerk authentication integration. Additionally, sensitive credentials in the `.env` file needed to be updated.

- **The Fix & The Feeling:** This was a significant manual effort. **2701kai** personally went through the `db.json` file, line by line, to remove the stale user entries, purged incorrect records from Clerk, and updated the `.env` file.
- For him, this was less of **a small step for a dev,** and more of **a giant leap for mankind** - a true intellectual milestone. He was, to put it mildly, slightly proud.

  > **Fictional Senior Dev (off-comment):**<br> _"Yaay, great again... though he´s not quite sure if he fixed the 8 billion issues he was the root cause for in the first place. But we'll take the win."_
  >
  > Whatever.

- **Outcome:** The user database is now clean, accurate, and in sync with the authentication provider. This strenuous but necessary task ensures data integrity and security moving forward.

---

These fixes enhance the overall stability, performance, and polish of the Canban application.
