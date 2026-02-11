<?php
// photos.php - Host this on your Synology Web Station

// Enable error logging but disable display to prevent breaking JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');

// Set the content type BEFORE any output
header('Content-Type: application/json; charset=utf-8');

// CORS Configuration - MUST come early
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Set UTF-8 encoding to prevent encoding issues
header("Content-Encoding: UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start output buffering to catch any unexpected output
ob_start();

// Configuration
$imageDirectory = __DIR__ . '/gallery'; // Use the "gallery" subfolder inside this script's directory
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Check if we're being called through a proxy (X-Forwarded-Host header)
$useRelativeUrls = isset($_SERVER['HTTP_X_FORWARDED_PROTO']); // Simple proxy detection

// Category mapping based on folder names
$categoryMap = [
    'placeholder' => 'filter-app',
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
        error_log("EXIF functions not available for: $filePath");
        return $metadata;
    }
    
    // Suppress warnings but capture them
    $exif = @exif_read_data($filePath, 0, true);
    
    if (!$exif) {
        error_log("Could not read EXIF data from: $filePath");
        return $metadata;
    }
    
    // DEBUG: Log ALL available EXIF fields for the first image
    static $firstImageLogged = false;
    if (!$firstImageLogged) {
        error_log("=== COMPLETE EXIF DATA FOR: $filePath ===");
        error_log(print_r($exif, true));
        error_log("=== END EXIF DATA ===");
        $firstImageLogged = true;
    }
    
    // Camera Model
    if (isset($exif['IFD0']['Model'])) {
        $metadata['camera'] = trim($exif['IFD0']['Model']);
    }
    
    // Lens Model
    if (isset($exif['EXIF']['LensModel'])) {
        $metadata['lens'] = trim($exif['EXIF']['LensModel']);
    } elseif (isset($exif['EXIF']['UndefinedTag:0xA434'])) {
        $metadata['lens'] = trim($exif['EXIF']['UndefinedTag:0xA434']);
    }
    
    // ISO - try multiple possible fields
    if (isset($exif['EXIF']['ISOSpeedRatings'])) {
        $iso = $exif['EXIF']['ISOSpeedRatings'];
        $metadata['iso'] = is_array($iso) ? (string)$iso[0] : (string)$iso;
    } elseif (isset($exif['EXIF']['PhotographicSensitivity'])) {
        $metadata['iso'] = (string)$exif['EXIF']['PhotographicSensitivity'];
    }
    
    // Aperture (F-Number)
    if (isset($exif['EXIF']['FNumber'])) {
        $fNumber = $exif['EXIF']['FNumber'];
        if (is_string($fNumber) && strpos($fNumber, '/') !== false) {
            $parts = explode('/', $fNumber);
            if (count($parts) == 2 && $parts[1] != 0) {
                $fValue = $parts[0] / $parts[1];
                $metadata['aperture'] = 'f/' . number_format($fValue, 1);
            }
        } elseif (is_numeric($fNumber)) {
            $metadata['aperture'] = 'f/' . number_format($fNumber, 1);
        }
    } elseif (isset($exif['COMPUTED']['ApertureFNumber'])) {
        $metadata['aperture'] = $exif['COMPUTED']['ApertureFNumber'];
    }
    
    // Shutter Speed / Exposure Time
    if (isset($exif['EXIF']['ExposureTime'])) {
        $exposure = $exif['EXIF']['ExposureTime'];
        if (is_string($exposure) && strpos($exposure, '/') !== false) {
            $parts = explode('/', $exposure);
            if (count($parts) == 2 && $parts[1] != 0) {
                $expValue = $parts[0] / $parts[1];
                if ($expValue >= 1) {
                    $metadata['shutterSpeed'] = number_format($expValue, 1) . 's';
                } else {
                    // Show as fraction for fast shutter speeds
                    $metadata['shutterSpeed'] = $exposure . 's';
                }
            }
        } else {
            $metadata['shutterSpeed'] = $exposure . 's';
        }
    }
    
    // Focal Length
    if (isset($exif['EXIF']['FocalLength'])) {
        $focalLength = $exif['EXIF']['FocalLength'];
        if (is_string($focalLength) && strpos($focalLength, '/') !== false) {
            $parts = explode('/', $focalLength);
            if (count($parts) == 2 && $parts[1] != 0) {
                $focal = $parts[0] / $parts[1];
                $metadata['focalLength'] = round($focal) . 'mm';
            }
        } elseif (is_numeric($focalLength)) {
            $metadata['focalLength'] = round($focalLength) . 'mm';
        }
    }
    
    // Date Taken
    if (isset($exif['EXIF']['DateTimeOriginal'])) {
        $dateTime = $exif['EXIF']['DateTimeOriginal'];
        $timestamp = strtotime($dateTime);
        if ($timestamp !== false) {
            $metadata['dateTaken'] = date('Y-m-d', $timestamp);
        }
    } elseif (isset($exif['IFD0']['DateTime'])) {
        $dateTime = $exif['IFD0']['DateTime'];
        $timestamp = strtotime($dateTime);
        if ($timestamp !== false) {
            $metadata['dateTaken'] = date('Y-m-d', $timestamp);
        }
    }
    
    // GPS Location (if available)
    if (isset($exif['GPS']['GPSLatitude']) && isset($exif['GPS']['GPSLongitude'])) {
        // Convert GPS coordinates to decimal
        $lat = gpsToDecimal($exif['GPS']['GPSLatitude'], $exif['GPS']['GPSLatitudeRef']);
        $lon = gpsToDecimal($exif['GPS']['GPSLongitude'], $exif['GPS']['GPSLongitudeRef']);
        
        if ($lat !== null && $lon !== null) {
            $metadata['gps'] = [
                'latitude' => $lat,
                'longitude' => $lon
            ];
            // You could add reverse geocoding here if needed
        }
    }
    
    // Log what metadata was found (for debugging)
    if (!empty($metadata)) {
        error_log("Extracted metadata from $filePath: " . json_encode($metadata));
    } else {
        error_log("No metadata extracted from $filePath");
    }
    
    return $metadata;
}

/**
 * Convert GPS coordinates to decimal format
 */
function gpsToDecimal($coordinate, $hemisphere) {
    if (!is_array($coordinate) || count($coordinate) < 3) {
        return null;
    }
    
    $degrees = count($coordinate) > 0 ? floatval($coordinate[0]) : 0;
    $minutes = count($coordinate) > 1 ? floatval($coordinate[1]) : 0;
    $seconds = count($coordinate) > 2 ? floatval($coordinate[2]) : 0;
    
    $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);
    
    // Make negative if South or West
    if ($hemisphere == 'S' || $hemisphere == 'W') {
        $decimal *= -1;
    }
    
    return $decimal;
}

/**
 * Recursively scan directory for images
 */
function scanImagesRecursive($directory, $imageUrlBase, $allowedExtensions, $categoryMap, $relativePath = '') {
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
            $subImages = scanImagesRecursive($fullPath, $imageUrlBase, $allowedExtensions, $categoryMap, $relativeItemPath);
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
                
                // Construct image URL - encode each path segment separately
                $pathSegments = explode('/', $relativeItemPath);
                $encodedSegments = array_map('rawurlencode', $pathSegments);
                $imageUrl = $imageUrlBase . '/' . implode('/', $encodedSegments);
                
                $imageData = [
                    'src' => $imageUrl,
                    'title' => pathinfo($item, PATHINFO_FILENAME),
                    'category' => $category,
                    'width' => $dimensions[0] ?? 800,
                    'height' => $dimensions[1] ?? 600,
                    '_debug_exif_available' => function_exists('exif_read_data'),
                    '_debug_file_path' => $fullPath
                ];
                
                // Add metadata if available
                if (!empty($metadata)) {
                    $imageData['metadata'] = $metadata;
                }
                
                // Add debug EXIF if available - read directly here
                if (function_exists('exif_read_data')) {
                    $debugExif = @exif_read_data($fullPath, 0, true);
                    if ($debugExif !== false && $debugExif !== null) {
                        $imageData['_debug_raw_exif'] = $debugExif;
                    } else {
                        $imageData['_debug_exif_error'] = 'exif_read_data returned false/null';
                    }
                } else {
                    $imageData['_debug_exif_error'] = 'exif_read_data function not available';
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
    
    // Use relative paths if being proxied, absolute URLs otherwise
    if ($useRelativeUrls) {
        // When accessed through proxy, return relative URLs
        $imageUrlBase = '/api/images';
    } else {
        // When accessed directly, use full URLs to assets domain
        $baseUrl = "$protocol://$_SERVER[HTTP_HOST]";
        $imageUrlBase = $baseUrl . '/gallery';
    }

    if (!is_dir($imageDirectory)) {
        // Clear any buffered output to ensure clean JSON response
        ob_end_clean();
        http_response_code(404);
        
        $errorInfo = [
            'error' => 'Directory not found',
            'path' => $imageDirectory,
            'realpath' => realpath($imageDirectory),
            'cwd' => getcwd(),
            '__DIR__' => __DIR__,
            'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'not set',
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'not set'
        ];
        error_log('Photos.php error: ' . json_encode($errorInfo));
        echo json_encode($errorInfo);
        exit;
    }
    
    // DETAILED DEBUG: Check what's in the directory
    $directoryContents = [];
    if (is_dir($imageDirectory)) {
        $items = scandir($imageDirectory);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            $fullPath = $imageDirectory . '/' . $item;
            $directoryContents[] = [
                'name' => $item,
                'is_dir' => is_dir($fullPath),
                'is_readable' => is_readable($fullPath),
                'size' => is_file($fullPath) ? filesize($fullPath) : 'N/A'
            ];
        }
    }
    
    // Scan images recursively
    $images = scanImagesRecursive($imageDirectory, $imageUrlBase, $allowedExtensions, $categoryMap);
    
    // Log success
    error_log('Photos.php: Successfully scanned ' . count($images) . ' images');
    
    // If no images found, return helpful debug info
    if (empty($images)) {
        // Clear any buffered output to ensure clean JSON response
        ob_end_clean();
        http_response_code(200);
        
        $debugInfo = [
            'error' => 'No images found',
            'directory' => $imageDirectory,
            'exists' => is_dir($imageDirectory),
            'readable' => is_readable($imageDirectory),
            'directory_contents' => $directoryContents,
            'allowed_extensions' => $allowedExtensions
        ];
        error_log('Photos.php warning: ' . json_encode($debugInfo));
        echo json_encode($debugInfo);
        exit;
    }
    
    // Clear output buffer and output clean JSON
    ob_end_clean();
    http_response_code(200);
    echo json_encode($images, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    // Clear any buffered output to ensure clean JSON response
    ob_end_clean();
    http_response_code(500);
    
    $errorInfo = [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ];
    error_log('Photos.php exception: ' . json_encode($errorInfo));
    echo json_encode($errorInfo);
}
?>
