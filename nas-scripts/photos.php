<?php
// photos.php - Host this on your Synology Web Station

// Disable error display to prevent breaking JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);

// CORS Configuration - MUST come ABSOLUTELY FIRST before ANY output
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type
header('Content-Type: application/json; charset=utf-8');

// Configuration
$imageDirectory = __DIR__ . '/gallery'; // Use the "gallery" subfolder inside this script's directory
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Category mapping based on folder names
$categoryMap = [
    'portrait' => 'filter-portrait',
    'street' => 'filter-street',
    'architecture' => 'filter-architecture',
    'landscape' => 'filter-landscape'
];

$images = [];

/**
 * Extract EXIF metadata from image
 */
function getImageMetadata($filePath) {
    $metadata = [];
    
    // Check if EXIF functions are available
    if (!function_exists('exif_read_data')) {
        return $metadata;
    }
    
    $exif = @exif_read_data($filePath, 0, true);
    
    if ($exif) {
        // Camera model
        if (isset($exif['IFD0']['Model'])) {
            $metadata['camera'] = trim($exif['IFD0']['Model']);
        }
        
        // Lens model
        if (isset($exif['EXIF']['LensModel'])) {
            $metadata['lens'] = trim($exif['EXIF']['LensModel']);
        } elseif (isset($exif['EXIF']['UndefinedTag:0xA434'])) {
            $metadata['lens'] = trim($exif['EXIF']['UndefinedTag:0xA434']);
        }
        
        // ISO
        if (isset($exif['EXIF']['ISOSpeedRatings'])) {
            $metadata['iso'] = (string)$exif['EXIF']['ISOSpeedRatings'];
        }
        
        // Aperture (F-Number)
        if (isset($exif['EXIF']['FNumber'])) {
            $fNumber = $exif['EXIF']['FNumber'];
            if (strpos($fNumber, '/') !== false) {
                $parts = explode('/', $fNumber);
                $fValue = $parts[0] / $parts[1];
                $metadata['aperture'] = 'f/' . number_format($fValue, 1);
            }
        } elseif (isset($exif['COMPUTED']['ApertureFNumber'])) {
            $metadata['aperture'] = $exif['COMPUTED']['ApertureFNumber'];
        }
        
        // Shutter Speed
        if (isset($exif['EXIF']['ExposureTime'])) {
            $metadata['shutterSpeed'] = $exif['EXIF']['ExposureTime'] . 's';
        }
        
        // Focal Length
        if (isset($exif['EXIF']['FocalLength'])) {
            $focalLength = $exif['EXIF']['FocalLength'];
            if (strpos($focalLength, '/') !== false) {
                $parts = explode('/', $focalLength);
                $focal = $parts[0] / $parts[1];
                $metadata['focalLength'] = round($focal) . 'mm';
            }
        }
        
        // Date Taken
        if (isset($exif['EXIF']['DateTimeOriginal'])) {
            $dateTime = $exif['EXIF']['DateTimeOriginal'];
            $metadata['dateTaken'] = date('Y-m-d', strtotime($dateTime));
        } elseif (isset($exif['IFD0']['DateTime'])) {
            $dateTime = $exif['IFD0']['DateTime'];
            $metadata['dateTaken'] = date('Y-m-d', strtotime($dateTime));
        }
        
        // GPS Location (if available)
        if (isset($exif['GPS']['GPSLatitude']) && isset($exif['GPS']['GPSLongitude'])) {
            // You could use a reverse geocoding service here
            // For now, just indicate GPS data is available
            $metadata['hasGPS'] = true;
        }
    }
    
    return $metadata;
}

/**
 * Recursively scan directory for images
 */
function scanImagesRecursive($directory, $baseUrl, $allowedExtensions, $categoryMap, $relativePath = '') {
    $images = [];
    
    if (!is_dir($directory)) {
        return $images;
    }
    
    $items = scandir($directory);
    
    if ($items === false) {
        return $images;
    }
    
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        
        $fullPath = $directory . '/' . $item;
        $relativeItemPath = $relativePath ? $relativePath . '/' . $item : $item;
        
        if (is_dir($fullPath)) {
            // Recursively scan subdirectory
            $subImages = scanImagesRecursive($fullPath, $baseUrl, $allowedExtensions, $categoryMap, $relativeItemPath);
            $images = array_merge($images, $subImages);
        } else {
            $extension = strtolower(pathinfo($item, PATHINFO_EXTENSION));
            
            if (in_array($extension, $allowedExtensions)) {
                // Skip if not readable
                if (!is_readable($fullPath)) continue;
                
                // Get image dimensions
                $dimensions = @getimagesize($fullPath);
                
                // Determine category based on folder path
                $category = 'filter-app'; // Default
                $pathParts = explode('/', strtolower($relativePath));
                
                foreach ($pathParts as $part) {
                    if (isset($categoryMap[$part])) {
                        $category = $categoryMap[$part];
                        break;
                    }
                }
                
                // If no category found in path, check filename
                if ($category === 'filter-app') {
                    $filenameLower = strtolower($item);
                    foreach ($categoryMap as $keyword => $cat) {
                        if (strpos($filenameLower, $keyword) !== false) {
                            $category = $cat;
                            break;
                        }
                    }
                }
                
                // Get EXIF metadata
                $metadata = getImageMetadata($fullPath);
                
                // If location not in EXIF, try to infer from folder name
                if (!isset($metadata['location']) && $relativePath) {
                    $folderName = basename($relativePath);
                    if ($folderName && !in_array(strtolower($folderName), array_keys($categoryMap))) {
                        $metadata['location'] = ucwords(str_replace(['_', '-'], ' ', $folderName));
                    }
                }
                
                // Construct absolute URL
                $imageUrl = $baseUrl . '/gallery/' . rawurlencode($relativeItemPath);
                
                $imageData = [
                    'src' => $imageUrl,
                    'title' => pathinfo($item, PATHINFO_FILENAME),
                    'category' => $category,
                    'width' => $dimensions[0] ?? 800,
                    'height' => $dimensions[1] ?? 600
                ];
                
                // Add metadata if available
                if (!empty($metadata)) {
                    $imageData['metadata'] = $metadata;
                }
                
                $images[] = $imageData;
            }
        }
    }
    
    return $images;
}

try {
    // Helper to get base URL
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
    $baseUrl = "$protocol://$_SERVER[HTTP_HOST]";

    if (!is_dir($imageDirectory)) {
        echo json_encode(['error' => 'Directory not found', 'path' => realpath($imageDirectory)]);
        exit;
    }
    
    // Scan images recursively
    $images = scanImagesRecursive($imageDirectory, $baseUrl, $allowedExtensions, $categoryMap);
    
    // Output JSON
    echo json_encode($images, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
