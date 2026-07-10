# AFM Sound Catalog

A searchable reference catalog of sound taxonomy labels used for audio annotation work. It lets anyone look up a canonical sound label (for example "Whispering" or "Dog Barking"), see its category, and open example reference clips for it. Contributors can add new reference links directly from the app.

Live app: https://afm-sound-library.web.app

Repository: https://github.com/sudo-Harshk/afm-sound-library

## Overview

The catalog covers 21 sound categories (human, animal, environmental, mechanical, impact, and other groups) with hundreds of individual canonical labels, each carrying zero or more reference links (YouTube, Pixabay, Freesound, Audio.com, SoundCloud, Instagram). Data is stored in Firestore and read live by the app; there is no build-time data bundling.

The app has two ways to find a sound:

- Search, with instant letter-by-letter filtering as you type. The query is reflected in the URL (`?q=...`) so a search is shareable and survives a page refresh.
- Browse, a grid of category tiles. Selecting a category opens its sounds as a draggable stack of cards (drag up or down, or use the on-screen controls) rather than a static list.

Each sound card shows its reference links as clickable chips. YouTube links play inline; other domains open in a new tab. A contributor can add a new reference link from the same card, subject to a domain allow-list.

The interface follows the system light/dark preference.

## Tech stack

- React 19 with Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file)
- Firebase (Firestore for data, Hosting for deployment)
- Framer Motion, for the draggable card stack
- lucide-react, for icons
- Oxlint, for linting

This is a plain JavaScript project (no TypeScript) and does not use the shadcn CLI. The reusable primitive in `src/components/ui/card-stack.jsx` follows shadcn's folder convention (`components/ui` for generic, app-agnostic building blocks) without adopting the rest of its tooling.

## Project structure

```
src/
  App.jsx                     top-level state: search query, active category, Firestore subscription
  main.jsx                    React entry point
  index.css                   Tailwind import, theme tokens (light/dark), base reset
  firebase.js                 Firebase app initialization (Firestore only)
  components/
    SearchBar.jsx              search input, keyboard shortcuts (Ctrl/Cmd+K, "/")
    CategoryList.jsx            category tile grid shown on the browse screen
    CategoryDetail.jsx          category header, card stack wiring, and playback/navigation controls
    LabelList.jsx                flat/grouped list view used for search results
    LabelRow.jsx                 one row in the list view (expand, references, add-reference form)
    SoundCardFace.jsx            the visual face of one card inside the card stack
    ui/
      card-stack.jsx              generic draggable card stack primitive (Framer Motion)
  lib/
    refs.js                      URL/domain helpers, allow-list, and search scoring
    icons.js                      keyword-to-icon mapping for categories
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
