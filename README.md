# AFM Sound Catalog

A searchable reference catalog of sound taxonomy labels used for audio annotation work. It lets anyone look up a canonical sound label (for example "Whispering" or "Dog Barking"), see its category, and open example reference clips for it. Contributors can add new reference links directly from the app.

Live app: https://afm-sound-library.web.app

Repository: https://github.com/sudo-Harshk/afm-sound-library

## Overview

The catalog covers 18 sound categories (human, animal, environmental, mechanical, impact, and other groups) with 203 canonical labels total, each carrying zero or more reference links (YouTube, Pixabay, Freesound, Audio.com, SoundCloud, Instagram). This label set is an exact match to the canonical sound taxonomy reference document - no extra or missing labels. Data is stored in Firestore and read live by the app; there is no build-time data bundling.

The app renders two distinct layouts from the same state, split at the Tailwind `lg` breakpoint:

- **Desktop** (`lg` and up): a fixed, drag-to-resize sidebar (200–480px, persisted to `localStorage`) lists categories with live counts; a sticky top bar holds the search input plus three labeled buttons (Docs, a dropdown linking to the reference PDFs; Tracker, an external link to the annotation tracker; and Help, which launches a guided tour). The "N labels / N categories" summary sits just below, above the table. The main area is a sortable, paginated data table (10/25/50/100 rows per page, with a page window like `1 … 4 5 6 … 10` for large result sets) showing Canonical Label, Subcategory, and Description. Clicking a row opens a slide-in detail panel with the YouTube preview (if a reference is set), a metadata block (typical example, acoustic profile, confusable labels), the full taxonomy path, and the reference link list.
- **Mobile** (below `lg`): a simpler stacked layout - search bar up top, then either a grid of category tiles or, once a category/search is active, results as a flat list (`LabelList`/`LabelRow`) or a draggable stack of cards (`CategoryDetail` + `card-stack.jsx`, drag up/down or use on-screen controls).

Search does instant letter-by-letter filtering as you type, and the query is reflected in the URL (`?q=...`) so a search is shareable and survives a page refresh.

Reference links render as clickable chips; YouTube links play inline (embedded player), other domains open in a new tab. A contributor can add a new reference link, subject to a domain allow-list.

The interface follows the system light/dark preference, with a manual override toggle (persisted to `localStorage`) in the sidebar (desktop) or top-right header button (mobile).

First-time desktop users can click Help in the top bar for a guided tour: it walks through the sidebar, the Docs and Tracker links, a live search demo, and each section of the detail panel. The tour is desktop only.

## Tech stack

- React 19 with Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file)
- Firebase (Firestore for data, Hosting for deployment)
- Framer Motion, for the mobile draggable card stack
- lucide-react, for icons in the mobile layout
- Material Symbols (Google Fonts, loaded in `index.html`), for icons in the desktop layout
- Oxlint, for linting

This is a plain JavaScript project (no TypeScript) and does not use the shadcn CLI. The reusable primitive in `src/components/ui/card-stack.jsx` follows shadcn's folder convention (`components/ui` for generic, app-agnostic building blocks) without adopting the rest of its tooling.

## Data model

Firestore collection `sounds`, one document per canonical label:

```
{
  batch: number,             // originating import batch (internal bookkeeping)
  section: string,           // category, e.g. "Animal sounds"
  subcategory: string,       // finer grouping within a section
  canonicalLabel: string,    // the label shown in search and cards
  description: string,       // one-sentence definition of the label
  typicalExample: string,    // a concrete example scenario
  acousticProfile: string,   // short acoustic characterization (pitch, level, duration, texture)
  confusableLabels: string,  // annotation guidance on similar/adjacent labels
  references: [
    { url: string, addedBy: string, addedAt: string }
  ],
  createdAt: string
}
```

`description`, `typicalExample`, `acousticProfile`, and `confusableLabels` are sourced from the canonical taxonomy reference document and kept in sync via `scripts/cleanup-firestore.cjs`.

## Getting started

Prerequisites: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

This starts the Vite dev server and connects to the live Firestore project defined in `src/firebase.js`. There is no local emulator configured, so writes made during local development (adding a reference) go to the real database.

## Available scripts

- `npm run dev` - start the local dev server
- `npm run build` - production build to `dist/`
- `npm run preview` - preview the production build locally
- `npm run lint` - run Oxlint

Taxonomy maintenance scripts (run directly with `node`, write to the live Firestore project, no emulator):

- `node scripts/cleanup-firestore.cjs` - reconciles the `sounds` collection against `scripts/master-taxonomy.cjs`
- `node scripts/create-taxonomy-sheet.cjs` - exports the taxonomy to an .xlsx workbook
- `python scripts/download-sounds.py` - downloads sound effects from the YouTube URLs in `sound-urls/`, saving WAV masters and 320kbps MP3s

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
