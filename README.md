# AFM Sound Catalog

A searchable reference catalog of sound taxonomy labels used for audio annotation work. It lets anyone look up a canonical sound label (for example "Whispering" or "Dog Barking"), see its category, and open example reference clips for it. Contributors can add new reference links directly from the app.

Live app: https://afm-sound-library.web.app

Repository: https://github.com/sudo-Harshk/afm-sound-library

## Overview

The catalog covers 21 sound categories (human, animal, environmental, mechanical, impact, and other groups) with hundreds of individual canonical labels, each carrying zero or more reference links (YouTube, Pixabay, Freesound, Audio.com, SoundCloud, Instagram). Data is stored in Firestore and read live by the app; there is no build-time data bundling.

The app renders two distinct layouts from the same state, split at the Tailwind `lg` breakpoint:

- **Desktop** (`lg` and up): a fixed, drag-to-resize sidebar (200–480px, persisted to `localStorage`) lists categories with live counts; a sticky top bar holds search plus "N labels / N categories" stat chips; the main area is a sortable, paginated data table (10/25/50/100 rows per page, with a page window like `1 … 4 5 6 … 10` for large result sets). Clicking a row opens a slide-in detail panel with metadata, taxonomy path, and reference links.
- **Mobile** (below `lg`): a simpler stacked layout — search bar up top, then either a grid of category tiles or, once a category/search is active, results as a flat list (`LabelList`/`LabelRow`) or a draggable stack of cards (`CategoryDetail` + `card-stack.jsx`, drag up/down or use on-screen controls).

Search does instant letter-by-letter filtering as you type, and the query is reflected in the URL (`?q=...`) so a search is shareable and survives a page refresh.

Reference links render as clickable chips; YouTube links play inline (embedded player), other domains open in a new tab. A contributor can add a new reference link, subject to a domain allow-list.

The interface follows the system light/dark preference, with a manual override toggle (persisted to `localStorage`) in the sidebar (desktop) or top-right header button (mobile).

## Tech stack

- React 19 with Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file)
- Firebase (Firestore for data, Hosting for deployment)
- Framer Motion, for the mobile draggable card stack
- lucide-react, for icons in the mobile layout
- Material Symbols (Google Fonts, loaded in `index.html`), for icons in the desktop layout
- Oxlint, for linting

This is a plain JavaScript project (no TypeScript) and does not use the shadcn CLI. The reusable primitive in `src/components/ui/card-stack.jsx` follows shadcn's folder convention (`components/ui` for generic, app-agnostic building blocks) without adopting the rest of its tooling.

## Project structure

```
src/
  App.jsx                     top-level state: search query, active category, selected sound, Firestore subscription; renders both layouts
  main.jsx                    React entry point
  index.css                   Tailwind import, theme tokens (light/dark), base reset, animations
  firebase.js                 Firebase app initialization (Firestore only)
  components/
    Sidebar.jsx                desktop-only: fixed, drag-to-resize category nav + theme toggle
    TopBar.jsx                 desktop-only: sticky search bar + live stat chips (Ctrl/Cmd+K to focus)
    DataTable.jsx               desktop-only: sortable, paginated table of sounds
    Breadcrumb.jsx               desktop-only: category/search breadcrumb trail
    DetailPanel.jsx              slide-in panel with sound metadata, taxonomy path, and add-reference form
    SearchBar.jsx               mobile-only: search input, keyboard shortcuts (Ctrl/Cmd+K, "/")
    CategoryList.jsx            mobile-only: category tile grid shown on the browse screen
    CategoryDetail.jsx          mobile-only: category header, card stack wiring, and playback/navigation controls
    LabelList.jsx                mobile-only: flat/grouped list view used for search results
    LabelRow.jsx                 mobile-only: one row in the list view (expand, references, add-reference form)
    SoundCardFace.jsx            mobile-only: the visual face of one card inside the card stack
    ui/
      card-stack.jsx              generic draggable card stack primitive (Framer Motion), used by CategoryDetail
  lib/
    refs.js                      URL/domain helpers, allow-list, and search scoring
    icons.js                      keyword-to-icon mapping for categories (Material Symbols names)
    useTheme.js                   light/dark theme hook (system preference + manual override, persisted)
    useSidebarWidth.js            desktop sidebar drag-to-resize hook (clamped width, persisted)
firestore.rules                 Firestore security rules
firestore.indexes.json          Firestore index definitions
firebase.json                   Firebase Hosting + Firestore config
.firebaserc                     Firebase project alias
```

## Data model

Firestore collection `sounds`, one document per canonical label:

```
{
  batch: number,            // originating import batch (internal bookkeeping)
  section: string,          // category, e.g. "Animal sounds"
  subcategory: string,      // finer grouping within a section
  canonicalLabel: string,   // the label shown in search and cards
  references: [
    { url: string, addedBy: string, addedAt: string }
  ],
  createdAt: string
}
```

## Getting started

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

This starts the Vite dev server and connects to the live Firestore project defined in `src/firebase.js`. There is no local emulator configured, so writes made during local development (adding a reference) go to the real database.

## Available scripts

- `npm run dev` — start the local dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Deployment

The app deploys to Firebase Hosting from the `dist/` folder:

```bash
npm run build
npx firebase deploy --only hosting
```

`firebase.json` maps all routes to `index.html` (single-page app rewrite) and serves from `dist`.

## Security note

`firestore.rules` currently allows open read and write access to the `sounds` collection with no authentication:

```
allow read: if true;
allow write: if true;
```

This is workable for an internal tool with a trusted audience, but means anyone with the client config (which is public in any Firebase web app) can write to the database directly, not just through this app's own domain allow-list. If the catalog is opened up more broadly, consider adding Firebase Authentication and scoping writes accordingly.
