#!/usr/bin/env node
/**
 * Upload photos to Cloudinary and generate a static photos.json for the portfolio.
 *
 * Usage:
 *   npm run photos              # Upload new/changed photos, generate JSON
 *   npm run photos:dry          # Extract metadata only (no upload)
 *   npm run photos:force        # Re-upload all photos (ignore cache)
 *
 * Setup:
 *   1. Place photos in ./gallery/ organized by category subfolders
 *   2. Set env vars in .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
 *   3. npm install
 *   4. npm run photos
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const ExifReader = require("exifreader");

// Load .env file
require("dotenv").config();

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────
const GALLERY_DIR = path.resolve("./gallery");
const OUTPUT_JSON = path.resolve("./src/assets/photos.json");
const CACHE_FILE = path.resolve("./.upload-cache.json");
const CLOUDINARY_FOLDER = "portfolio";
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

// Category mapping (folder name → CSS filter class)
const CATEGORY_MAP = {
  placeholder: "filter-app",
  portrait: "filter-portrait",
  street: "filter-street",
  architecture: "filter-architecture",
  landscape: "filter-landscape",
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function fileHash(filepath) {
  const data = fs.readFileSync(filepath);
  return crypto.createHash("md5").update(data).digest("hex");
}

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function titleFromFilename(filename) {
  return path
    .parse(filename)
    .name.replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ──────────────────────────────────────────────
// EXIF Metadata Extraction
// ──────────────────────────────────────────────

function formatShutterSpeed(exposureTime) {
  if (!exposureTime) return null;
  const val =
    typeof exposureTime === "object" && exposureTime.description
      ? parseFloat(exposureTime.description)
      : parseFloat(exposureTime);
  if (isNaN(val) || val === 0) return null;
  if (val >= 1) return `${val.toFixed(1)}s`;
  const denom = Math.round(1 / val);
  return `1/${denom}s`;
}

function extractMetadata(filepath) {
  const metadata = {};
  try {
    const buffer = fs.readFileSync(filepath);
    const tags = ExifReader.load(buffer, { expanded: true });

    // Camera model
    if (tags.exif?.Model?.description) {
      metadata.camera = tags.exif.Model.description.trim();
    }

    // Lens model
    if (tags.exif?.LensModel?.description) {
      metadata.lens = tags.exif.LensModel.description.trim();
    }

    // ISO
    if (tags.exif?.ISOSpeedRatings?.value) {
      metadata.iso = String(tags.exif.ISOSpeedRatings.value);
    }

    // Aperture (FNumber)
    if (tags.exif?.FNumber?.description) {
      const fNum = parseFloat(tags.exif.FNumber.description);
      if (!isNaN(fNum)) {
        metadata.aperture =
          fNum % 1 === 0 ? `f/${fNum}` : `f/${fNum.toFixed(1)}`;
      }
    }

    // Shutter speed
    if (tags.exif?.ExposureTime) {
      const ss = formatShutterSpeed(tags.exif.ExposureTime);
      if (ss) metadata.shutterSpeed = ss;
    }

    // Focal length
    if (tags.exif?.FocalLength?.description) {
      const fl = parseFloat(tags.exif.FocalLength.description);
      if (!isNaN(fl)) {
        metadata.focalLength = fl === Math.floor(fl) ? `${fl}mm` : `${fl.toFixed(1)}mm`;
      }
    }

    // Date taken
    if (tags.exif?.DateTimeOriginal?.description) {
      const raw = tags.exif.DateTimeOriginal.description;
      // EXIF date format: "YYYY:MM:DD HH:MM:SS"
      const dateStr = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        metadata.dateTaken = d.toISOString().split("T")[0];
      }
    }

    // GPS coordinates
    if (tags.gps?.Latitude != null && tags.gps?.Longitude != null) {
      metadata.gps = {
        latitude: Math.round(tags.gps.Latitude * 1e6) / 1e6,
        longitude: Math.round(tags.gps.Longitude * 1e6) / 1e6,
      };
    }

    // Image dimensions
    const width =
      tags.file?.["Image Width"]?.value ||
      tags.exif?.PixelXDimension?.value ||
      tags.exif?.ImageWidth?.value;
    const height =
      tags.file?.["Image Height"]?.value ||
      tags.exif?.PixelYDimension?.value ||
      tags.exif?.ImageLength?.value;
    if (width) metadata._width = Number(width);
    if (height) metadata._height = Number(height);
  } catch (err) {
    console.warn(`  Warning: Could not extract EXIF from ${path.basename(filepath)}: ${err.message}`);
  }
  return metadata;
}

// ──────────────────────────────────────────────
// Gallery Scanner
// ──────────────────────────────────────────────

function scanGallery() {
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error(`Error: Gallery directory '${GALLERY_DIR}' does not exist.`);
    console.error("Create it with category subfolders:");
    console.error("  gallery/");
    console.error("    landscape/");
    console.error("      photo1.jpg");
    console.error("    portrait/");
    console.error("      photo2.jpg");
    process.exit(1);
  }

  const images = [];
  const categoryDirs = fs
    .readdirSync(GALLERY_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const dir of categoryDirs) {
    const folderName = dir.name.toLowerCase();
    const cssCategory = CATEGORY_MAP[folderName] || `filter-${folderName}`;
    const dirPath = path.join(GALLERY_DIR, dir.name);

    const files = fs
      .readdirSync(dirPath)
      .filter((f) => ALLOWED_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort();

    for (const file of files) {
      images.push({
        path: path.join(dirPath, file),
        relPath: path.join(dir.name, file).replace(/\\/g, "/"),
        categoryFolder: folderName,
        cssCategory,
      });
    }
  }
  return images;
}

// ──────────────────────────────────────────────
// Cloudinary Upload
// ──────────────────────────────────────────────

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Error: Missing Cloudinary credentials.");
    console.error("Set these in your .env file:");
    console.error("  CLOUDINARY_CLOUD_NAME=your_cloud_name");
    console.error("  CLOUDINARY_API_KEY=your_api_key");
    console.error("  CLOUDINARY_API_SECRET=your_api_secret");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log(`Cloudinary configured for cloud: ${cloudName}`);
}

async function uploadImage(filepath, categoryFolder, cache) {
  const relPath = path.relative(GALLERY_DIR, filepath).replace(/\\/g, "/");
  const currentHash = fileHash(filepath);

  // Check cache
  if (cache[relPath] && cache[relPath].hash === currentHash) {
    console.log(`  Skipped (unchanged): ${relPath}`);
    return { result: cache[relPath].result, cached: true };
  }

  const stem = path.parse(filepath).name;
  // Sanitize: replace spaces with hyphens, lowercase — Cloudinary treats spaces as folder separators
  const safeStem = stem.replace(/\s+/g, "-").toLowerCase();
  const folder = `${CLOUDINARY_FOLDER}/${categoryFolder}`;
  const publicId = `${folder}/${safeStem}`;

  console.log(`  Uploading: ${relPath} → ${publicId}`);
  try {
    const result = await cloudinary.uploader.upload(filepath, {
      public_id: safeStem,
      folder: folder,
      asset_folder: folder,
      overwrite: true,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    const cached = {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      version: result.version,
    };

    cache[relPath] = { hash: currentHash, result: cached };
    saveCache(cache);

    return { result: cached, cached: false };
  } catch (err) {
    console.error(`  Error uploading ${relPath}: ${err.message}`);
    return null;
  }
}

function buildCloudinaryUrl(publicId, transform = "") {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (transform) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

// ──────────────────────────────────────────────
// JSON Generation
// ──────────────────────────────────────────────

function generatePhotosJson(entries) {
  // Sort by date taken (newest first)
  entries.sort((a, b) => {
    const da = a.metadata?.dateTaken || "0000-00-00";
    const db = b.metadata?.dateTaken || "0000-00-00";
    return db.localeCompare(da);
  });

  const dir = path.dirname(OUTPUT_JSON);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(entries, null, 2), "utf-8");
  console.log(`\nGenerated ${OUTPUT_JSON} with ${entries.length} photos.`);
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const cleanCache = args.includes("--clean-cache");

  if (cleanCache) {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
      console.log("Upload cache deleted.");
    } else {
      console.log("No cache file found.");
    }
    return;
  }

  console.log("=".repeat(60));
  console.log("Portfolio Photo Uploader → Cloudinary");
  console.log("=".repeat(60));

  const images = scanGallery();
  console.log(`\nFound ${images.length} images in ${GALLERY_DIR}/`);

  if (images.length === 0) {
    console.log("No images found. Add photos to gallery subfolders and try again.");
    return;
  }

  // ── Dry Run ──
  if (dryRun) {
    console.log("\n[DRY RUN] Extracting metadata only (no uploads)...\n");
    const entries = [];

    for (const img of images) {
      console.log(`  Processing: ${img.relPath}`);
      const meta = extractMetadata(img.path);
      const width = meta._width || 0;
      const height = meta._height || 0;
      delete meta._width;
      delete meta._height;

      if (!meta.location) {
        meta.location = img.categoryFolder.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      }

      entries.push({
        src: img.relPath,
        title: titleFromFilename(path.basename(img.path)),
        category: img.cssCategory,
        width,
        height,
        metadata: meta,
      });
    }

    generatePhotosJson(entries);
    console.log("\n[DRY RUN] Complete. photos.json uses local paths.");
    console.log("Run without --dry-run to upload to Cloudinary.");
    return;
  }

  // ── Full Upload ──
  configureCloudinary();

  let cache = force ? {} : loadCache();
  if (force) console.log("\n[FORCE] Ignoring cache — re-uploading all photos.\n");

  console.log("\nUploading photos...\n");
  const entries = [];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const img of images) {
    const uploadResult = await uploadImage(img.path, img.categoryFolder, cache);

    if (!uploadResult) {
      failed++;
      continue;
    }

    if (uploadResult.cached) skipped++;
    else uploaded++;

    const meta = extractMetadata(img.path);
    const width = uploadResult.result.width || meta._width || 0;
    const height = uploadResult.result.height || meta._height || 0;
    delete meta._width;
    delete meta._height;

    if (!meta.location) {
      meta.location = img.categoryFolder.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    const publicId = uploadResult.result.public_id;

    entries.push({
      src: buildCloudinaryUrl(publicId, "w_1200,q_75,f_auto,dpr_auto"),
      thumb: buildCloudinaryUrl(publicId, "c_fill,g_auto,w_400,h_600,q_70,f_auto"),
      title: titleFromFilename(path.basename(img.path)),
      category: img.cssCategory,
      width,
      height,
      metadata: meta,
    });
  }

  generatePhotosJson(entries);

  console.log("\nDone!");
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Skipped (cached): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total in photos.json: ${entries.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
