#!/bin/bash
#
# NAS photo sync for MyPortfolio
# ──────────────────────────────
# Runs upload_photos.js on the NAS against a gallery folder outside the
# git repo, and writes photos.json straight into the content volume so
# nginx picks it up without a container rebuild (see
# docker-compose.override.yml.example).
#
# Typical schedule: Synology Task Scheduler, nightly. Safe to run more
# often — the upload cache (hash-keyed) skips unchanged files.
#
# First-time setup:
#   1. Enable the content volume override (see DEPLOYMENT.md).
#   2. Copy .env.example → $PROJECT_DIR/.env and fill in Cloudinary creds.
#   3. Put photos in $GALLERY_DIR organised by category subfolder, e.g.
#        /volume1/photo/portfolio/landscape/sunset.jpg
#   4. Schedule this script.

set -u

# --- CONFIGURATION (override via env if needed) ---
PROJECT_DIR="${PROJECT_DIR:-/volume1/docker/portfolio/MyPortfolio}"
CONTENT_DIR="${CONTENT_DIR:-/volume1/docker/portfolio/content}"
GALLERY_DIR="${GALLERY_DIR:-/volume1/photo/portfolio}"
PHOTOS_JSON="${PHOTOS_JSON:-$CONTENT_DIR/photos.json}"
PHOTOS_CACHE="${PHOTOS_CACHE:-$CONTENT_DIR/.upload-cache.json}"
LOG_FILE="${LOG_FILE:-$PROJECT_DIR/sync_photos_log.txt}"
MAX_LOG_SIZE=1048576  # 1 MB — rotate beyond this

# Rotate log if it grows too large
if [ -f "$LOG_FILE" ] && [ "$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)" -gt "$MAX_LOG_SIZE" ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

exec > >(tee -a "$LOG_FILE") 2>&1

echo "---------------------------------"
echo "Photo sync started at: $(date)"
echo "  gallery  = $GALLERY_DIR"
echo "  output   = $PHOTOS_JSON"
echo "  cache    = $PHOTOS_CACHE"

# Sanity checks
for dir in "$PROJECT_DIR" "$GALLERY_DIR" "$CONTENT_DIR"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Missing directory: $dir"
        exit 1
    fi
done

cd "$PROJECT_DIR" || { echo "❌ Failed to cd to $PROJECT_DIR"; exit 1; }

# Ensure dependencies exist. upload_photos.js needs cloudinary, exifreader,
# dotenv — installed once by `npm install` on the NAS.
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "❌ node_modules missing — run 'npm install' in $PROJECT_DIR first."
    exit 1
fi

# Invoke the uploader with NAS paths. Uses --quiet npm flag via direct node
# call to avoid npm-script overhead.
GALLERY_DIR="$GALLERY_DIR" \
PHOTOS_JSON="$PHOTOS_JSON" \
PHOTOS_CACHE="$PHOTOS_CACHE" \
/usr/local/bin/node upload_photos.js || {
    echo "❌ upload_photos.js failed."
    exit 1
}

echo "✅ Photo sync complete."
echo "Job finished at: $(date)"
