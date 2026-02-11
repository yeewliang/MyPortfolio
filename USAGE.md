# Photo Gallery Management

## Overview

Photos are hosted on **Cloudinary CDN** (free tier). A Node.js script (`upload_photos.js`) handles:
- Uploading photos to Cloudinary
- Extracting EXIF metadata (camera, lens, ISO, aperture, shutter speed, focal length, date, GPS)
- Generating `src/assets/photos.json` which the portfolio reads at runtime

## Setup

### 1. Cloudinary Account
1. Sign up at https://cloudinary.com (free: 25 credits/month, ~25GB bandwidth)
2. Go to Dashboard → copy your Cloud Name, API Key, and API Secret

### 2. Environment Variables
```bash
cp .env.example .env
# Edit .env with your Cloudinary credentials
```

### 3. Install Dependencies
```bash
npm install
```

## Adding Photos

1. Organize photos in `gallery/` by category:
   ```
   gallery/
     landscape/
       mountain-sunset.jpg
       ocean-view.jpg
     portrait/
       studio-headshot.jpg
     street/
       night-market.jpg
     architecture/
       skyline.jpg
   ```

2. Run the upload script:
   ```bash
   npm run photos
   ```

3. Commit and push:
   ```bash
   git add src/assets/photos.json
   git commit -m "Update gallery"
   git push
   ```

## Script Options

| Command | Description |
|---------|-------------|
| `npm run photos` | Upload new/changed photos, generate JSON |
| `npm run photos:dry` | Extract metadata only, no Cloudinary upload |
| `npm run photos:force` | Re-upload all photos (ignore cache) |
| `node upload_photos.js --clean-cache` | Delete the upload cache file |

## Category Mapping

| Folder Name | CSS Class | Filter Button |
|-------------|-----------|---------------|
| `landscape` | `filter-landscape` | Landscape |
| `portrait` | `filter-portrait` | Portrait |
| `street` | `filter-street` | Street |
| `architecture` | `filter-architecture` | Architecture |
| `placeholder` | `filter-app` | App |

Custom folders automatically map to `filter-<foldername>`.

## How It Works

```
Local Machine                    Cloudinary CDN              Portfolio Site
┌─────────────┐                 ┌───────────────┐          ┌──────────────┐
│ gallery/    │  upload_photos  │ Auto-optimized │  <img>   │ Browser      │
│  landscape/ │ ──────────────▶ │ WebP/AVIF      │ ◀─────── │ loads from   │
│  portrait/  │   + EXIF data   │ Responsive     │          │ photos.json  │
│  street/    │                 │ CDN-cached     │          │              │
└─────────────┘                 └───────────────┘          └──────────────┘
       │                                                          ▲
       │  generates                                               │
       └──────────▶ src/assets/photos.json ───── git push ────────┘
```

## Image Optimization (`optimize_images.py`)

Optional pre-processing script for local format conversion:

```bash
pip install Pillow pillow-avif-plugin
mkdir raw_images
# Place high-res images in raw_images/
python optimize_images.py
# Optimized images saved to ready_to_upload/
```

> **Note:** Cloudinary handles format conversion (WebP/AVIF) and resizing automatically via URL transforms, so this script is only needed if you want local copies in multiple formats.
