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

$images = [];

try {
    // Helper to get base URL
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
    $baseUrl = "$protocol://$_SERVER[HTTP_HOST]";

    if (!is_dir($imageDirectory)) {
        echo json_encode(['error' => 'Directory not found', 'path' => realpath($imageDirectory)]);
        exit;
    }
    
    $files = scandir($imageDirectory);
    
    if ($files === false) {
        echo json_encode(['error' => 'Unable to scan directory']);
        exit;
    }
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        
        if (in_array($extension, $allowedExtensions)) {
            $filePath = $imageDirectory . '/' . $file;
            
            // Skip if not readable
            if (!is_readable($filePath)) continue;
            
            // Get image dimensions (suppress warnings)
            $dimensions = @getimagesize($filePath);
            
            // Determine category based on filename
            $category = 'filter-app'; // Default
            if (strpos(strtolower($file), 'nature') !== false) $category = 'filter-app';
            elseif (strpos(strtolower($file), 'urban') !== false) $category = 'filter-product';
            elseif (strpos(strtolower($file), 'travel') !== false) $category = 'filter-branding';
            elseif (strpos(strtolower($file), 'portrait') !== false) $category = 'filter-books';
            
            // Construct absolute URL
            $imageUrl = $baseUrl . '/gallery/' . rawurlencode($file);

            $images[] = [
                'src' => $imageUrl,
                'title' => pathinfo($file, PATHINFO_FILENAME),
                'category' => $category,
                'width' => $dimensions[0] ?? 800,
                'height' => $dimensions[1] ?? 600
            ];
        }
    }
    
    // Output JSON
    echo json_encode($images, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
