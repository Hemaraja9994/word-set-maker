# Word Set Maker

Build target-word practice sets for speech-sound therapy by target sound and word position, with the sound highlighted and a picture. Spreads words evenly, avoids words used recently for the same child, and prints word cards and a progress chart. English, Kannada, Telugu and Hindi. Works offline; data stays on the device.

Part of the ASLP App Kit series by Hemaraja Nayaka S, Department of Audiology & Speech-Language Pathology, Yenepoya Medical College Hospital, Mangaluru.

- **Data:** stays on the device where it is entered (IndexedDB). Nothing is sent to a server. Data saved by the earlier version is carried over automatically.
- **Works offline** after the first visit and can be added to a phone's home screen.
- **References:** a built-in library of short, cited passages (`src/app/refs.json`) searched on the device. No AI model and no internet needed; if nothing matches, the app says so.

## Built with

React 19, TypeScript, Tailwind CSS 4, Vite, vite-plugin-pwa (offline), Dexie (on-device storage), MiniSearch (reference search), Zod (checks the reference library), i18next (languages), Radix UI and Lucide icons.

## Folders

| Path | What it holds |
|---|---|
| `src/app/` | This app: screens, clinical logic, tests, references, translations |
| `src/shell/` | Parts shared by every app in the series: header, storage, buttons, reference search |
| `public/icon.svg` | App icon |
| `vercel.json` | Tells Vercel how to build the app |

## Work on it

```
npm install
npm run dev      # local preview
npm test         # clinical logic tests
npm run build    # production files in dist/
```

Every push to `main` is built and published by Vercel.

## Status

Version 1.0.0: for clinical review. Clinical content, word lists and translations should be checked by a qualified professional and native speakers before use with patients.

