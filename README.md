# Word Set Maker

Fresh weekly picture word sets by target sound and position, without repeats per client, with printable cards and a home practice chart.

Part of the ASLP App Kit series (phase 1.4) by Hemaraja Nayaka S, Department of Audiology & Speech-Language Pathology, Yenepoya Medical College Hospital, Mangaluru.

- **For:** Speech-language pathologists
- **Languages:** English, Kannada, Telugu, Hindi
- **Data:** stays in the browser on the device where it is entered. Nothing is sent to a server. Use the CSV or backup download regularly.
- **Works offline** after the first visit, and can be added to a phone's home screen.

## Files

| File | What it does |
|---|---|
| `index.html` | The app |
| `sw.js` | Keeps a copy on the device so the app works offline |
| `manifest.webmanifest`, `icon.svg` | Name and icon when installed on a phone |
| `vercel.json` | Stops Vercel caching the offline file, so updates reach users |

## Publish on Vercel (no terminal needed)

1. Push this folder to its own GitHub repository.
2. In Vercel, choose **Add New → Project**, pick the repository and press **Deploy**. No build settings are needed.
3. Every change committed to GitHub goes live within a minute. After changing the app, raise the version in `sw.js` (for example `-v1` to `-v2`) so phones fetch the new copy.

## Status

Version 0.1.0: a working draft for clinical review. Clinical content, word lists and translations should be checked by a qualified professional and native speakers before use with patients.
