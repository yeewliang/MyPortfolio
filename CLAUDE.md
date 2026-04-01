# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm start              # Dev server on port 8000 (alias: npm run dev)
npm run photos         # Upload new/changed photos to Cloudinary, regenerate photos.json
npm run photos:dry     # Extract EXIF metadata only (no upload)
npm run photos:force   # Force re-upload all photos (ignore cache)
npm run docker:dev     # Build and run Docker container (port 8080)
npm run compose:up     # Start via Docker Compose (port 8081)
```

No build step, linter, or test suite — static files are served directly.

## Architecture

**Static single-page portfolio** built with Bootstrap 5 and vanilla JavaScript (no framework). All content lives in `src/index.html` with hash-based section navigation (#hero, #about, #resume, #photography, #contact).

### Key files

- `src/index.html` — The entire site (all sections hardcoded here)
- `src/assets/js/main.js` — All client-side logic (IIFE pattern, vanilla JS)
- `src/assets/css/main.css` — All custom styles
- `src/assets/photos.json` — Generated photo metadata (do not hand-edit; produced by `upload_photos.js`)
- `upload_photos.js` — Node.js script that scans `gallery/` folders, extracts EXIF, uploads to Cloudinary, and writes `photos.json`
- `nginx.conf` — Production config with security headers, gzip, and caching rules

### Photo gallery pipeline

```
gallery/<category>/*.jpg  →  upload_photos.js  →  Cloudinary CDN
                                                      ↓
                                              src/assets/photos.json
                                                      ↓
                                          main.js fetches & renders
```

Photos are organized in `gallery/` by category folder (gitignored). The upload script uses `.upload-cache.json` to avoid re-uploading unchanged files. Cloudinary handles format conversion (WebP/AVIF) and responsive sizing.

### Vendor libraries (in `src/assets/vendor/`)

AOS (scroll animations), Typed.js (hero text), PureCounter (stat counters), GLightbox (photo lightbox), Isotope (masonry grid + filtering), Swiper, Bootstrap 5.3.3. These are vendored locally, not managed by npm.

### Deployment

Dockerized with `nginx:alpine`. The Dockerfile copies `src/` into the Nginx html directory. Deployment targets a Synology NAS (scripts in `nas-scripts/`).

## Environment Variables

Cloudinary credentials are required in `.env` for the photo upload script (see USAGE.md).
