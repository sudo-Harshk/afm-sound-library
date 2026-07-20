# AFM Sound Catalog

A searchable reference catalog of sound taxonomy labels used for audio annotation work. It lets anyone look up a canonical sound label (for example "Whispering" or "Dog Barking"), see its category, and open example reference clips for it. Authenticated admin contributors can add new reference links directly from the app.

Live app (production): https://afm-sound-library.web.app

Live app (dev/demo): https://afm-sound-library-dev.web.app

Repository: https://github.com/sudo-Harshk/afm-sound-library

## Overview

The catalog covers 18 sound categories (human, animal, environmental, mechanical, impact, and other groups) with 203 canonical labels total, each carrying zero or more reference links (YouTube, Pixabay, Freesound, Audio.com, SoundCloud, Instagram). This label set is an exact match to the canonical sound taxonomy reference document - no extra or missing labels. Data is stored in Firestore and read live by the app; there is no build-time data bundling.

The app renders two distinct layouts from the same state, split at the Tailwind `lg` breakpoint:

- **Desktop** (`lg` and up): a fixed, drag-to-resize sidebar (200–480px, persisted to `localStorage`) lists categories with live counts; a sticky top bar holds the search input plus labeled buttons (Docs, a dropdown linking to the reference PDFs; Tracker, an external link to the annotation tracker; and Help, which launches a guided tour). The "X total labels across Y categories" summary sits just below, above the table. The main area is a sortable, paginated data table (10/25/50/100 rows per page, with a page window like `1 … 4 5 6 … 10` for large result sets) showing Canonical Label, Subcategory, and Description. Clicking a row opens a slide-in detail panel with the YouTube preview (if a reference is set), a metadata block (typical example, acoustic profile, confusable labels), the full taxonomy path, and the reference link list.
- **Mobile** (below `lg`): a simpler stacked layout - search bar up top, then either a grid of category tiles or, once a category/search is active, results as a flat list (`LabelList`/`LabelRow`) or a draggable stack of cards (`CategoryDetail` + `card-stack.jsx`, drag up/down or use on-screen controls).

Search does instant letter-by-letter filtering as you type, and the query is reflected in the URL (`?q=...`) so a search is shareable and survives a page refresh.

Reference links render as clickable chips; YouTube links play inline (embedded player), audio URLs (mp3, wav, ogg, m4a, flac) play inline via an `<audio>` element, and other domains open in a new tab. Authenticated admin contributors can add or delete reference links.

The interface follows the system light/dark preference, with a manual override toggle (persisted to `localStorage`) in the sidebar (desktop) or top-right header button (mobile).

First-time desktop users can click Help in the top bar for a guided tour: it walks through the sidebar, the Docs and Tracker links, a live search demo, and each section of the detail panel. The tour is desktop only.

### Demo mode

The app supports a demo mode controlled by the `VITE_DEMO_MODE` environment variable. When set to `true`, the following features are hidden:

- Docs and Tracker buttons
- Reference add/delete buttons
- Admin login

This is used for the dev site (`afm-sound-library-dev.web.app`) which serves as a read-only demo for presentations.

### Admin access

Reference management (adding and deleting links) is restricted to authenticated admin users. The login button is hidden by default on production and only appears when visiting the site with `?admin=true` in the URL (e.g. `https://afm-sound-library.web.app/?admin=true`) or when a returning user already has an active session. Once signed in, the button crossfades to a Logout state with an accent style to indicate the active session. The admin login persists across sessions via `localStorage` so returning users do not need the `?admin=true` param again.

## Tech stack

- React 19 with Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file)
- Firebase (Firestore for data, Authentication for admin access, Hosting for deployment)
- Firebase Admin SDK (for setting admin custom claims via script)
- Framer Motion, for the mobile draggable card stack and the animated Login/Logout crossfade toggle (desktop + mobile)
- lucide-react, for icons in the mobile layout
- Material Symbols (Google Fonts, loaded in `index.html`), for icons in the desktop and mobile layouts
- Oxlint, for linting
- Vitest, for unit tests

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

## Environment variables

The app uses Vite environment variables prefixed with `VITE_`. Copy `.env.example` to `.env` and fill in your Firebase project values.

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain (e.g. `project.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_DEMO_MODE` | Set to `true` to enable demo mode (hides Docs, Tracker, add/delete reference buttons, admin login) |

Two environment files are used:

- `.env` — production config (`VITE_DEMO_MODE=false`), connects to the `afm-sound-library` Firestore project
- `.env.development` — dev config (`VITE_DEMO_MODE=true`), connects to the same `afm-sound-library` Firestore project (the `afm-sound-library-dev` project is only the Hosting target, not a separate database)

Both files are gitignored and must be created manually from `.env.example`.

## Getting started

Prerequisites: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env   # fill in Firebase config values
npm run dev
```

This starts the Vite dev server. Vite loads `.env` first, then `.env.development` overrides it (if present), so with both files present the dev server runs in demo mode and connects to the live Firestore project. There is no local emulator configured, so writes made during local development (adding a reference) go to the real database.

To run in demo mode locally, either ensure `.env.development` exists (it sets `VITE_DEMO_MODE=true` by default), set `VITE_DEMO_MODE=true` in your `.env` file, or use the development build:

```bash
npm run build:dev   # builds with VITE_DEMO_MODE=true from .env.development
```

## Available scripts

- `npm run dev` — start the local dev server
- `npm run build` — production build to `dist/`
- `npm run build:dev` — development build with demo mode enabled
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint
- `npm run test` — run Vitest unit tests
- `npm run test:watch` — run tests in watch mode
- `npm run deploy` — build and deploy to production Firebase Hosting
- `npm run deploy:dev` — build (demo mode) and deploy to dev Firebase Hosting
- `npm run set-admin` — run the admin claims script (see Admin setup below)

Taxonomy maintenance scripts (run directly with `node`, write to the live Firestore project, no emulator):

- `node scripts/cleanup-firestore.cjs` — reconciles the `sounds` collection against `scripts/master-taxonomy.cjs`
- `node scripts/create-taxonomy-sheet.cjs` — exports the taxonomy to an .xlsx workbook
- `python scripts/download-sounds.py` — downloads sound effects from the YouTube URLs in `sound-urls/`, saving WAV masters and 320kbps MP3s

## Deployment

The app uses Firebase's multi-project setup. `.firebaserc` defines two targets:

```json
{
  "projects": {
    "default": "afm-sound-library",
    "dev": "afm-sound-library-dev"
  }
}
```

### Production

```bash
npm run deploy
```

Builds with `VITE_DEMO_MODE=false` (from `.env`) and deploys to `afm-sound-library.web.app`. Full features: Docs, Tracker, and admin add/delete reference buttons are available.

### Dev/demo site

```bash
npm run deploy:dev
```

Builds with `VITE_DEMO_MODE=true` (from `.env.development`) and deploys to `afm-sound-library-dev.web.app`. Read-only demo: Docs, Tracker, reference add/delete buttons, and admin login are hidden.

### Firestore rules

Security rules are deployed separately and apply to both projects:

```bash
firebase deploy --only firestore:rules -P default   # production
firebase deploy --only firestore:rules -P dev        # dev
```

## Admin setup

Reference management is restricted to authenticated admin users with a custom `admin` claim set via the Firebase Admin SDK.

### 1. Enable authentication providers

In the Firebase Console for your project:

1. Go to **Authentication** > **Sign-in method**
2. Enable **Google** (set a support email)
3. Enable **Email/Password**

### 2. Download service account key

1. Firebase Console > **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Save the downloaded JSON as `service-account-key.json` in the project root (gitignored)

### 3. Create user accounts

In Firebase Console > **Authentication** > **Users**, create accounts for each admin user. Note their UIDs.

### 4. Set admin claims

```bash
node scripts/set-admin-claims.cjs <uid1> <uid2> <uid3> <uid4>
```

Users must sign out and sign back in for claims to take effect.

### 5. Access admin login

The login button is hidden by default. Visit the site with `?admin=true` in the URL:

```
https://afm-sound-library.web.app/?admin=true
```

Once signed in, the button crossfades to show a Logout icon and text. Sign out by clicking it again.

## Security note

Firestore security rules restrict read and write access as follows:

```
allow read: if true;
allow write: if request.auth != null && request.auth.token.admin == true;
```

- **Reads** are open — anyone can browse the catalog
- **Writes** require authentication and an `admin` custom claim — only users with the claim can add or delete reference links

The `admin` claim is set server-side via the Firebase Admin SDK (`scripts/set-admin-claims.cjs`) and cannot be forged by client-side code. The service account key used by this script is gitignored and never committed to the repository.

On the dev site (`VITE_DEMO_MODE=true`), the auth system is skipped entirely and all write UI is hidden, making it a read-only demo.
