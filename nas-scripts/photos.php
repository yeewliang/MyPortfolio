<?php
// photos.php - Host this on your Synology Web Station

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
header('Content-Type: application/json');

// Configuration
$imageDirectory = '.'; // Current directory (since this is the web root)
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

$images = [];

// Helper to get base URL
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
$baseUrl = "$protocol://$_SERVER[HTTP_HOST]";
// If the script is in a subdirectory, you might need to append that. 
// But since this is root, HTTP_HOST is sufficient.
// If it's in a subfolder like /assets/, REQUEST_URI would help, but let's stick to simple for root.
// Actually, safer to use directory of the script if not root, but user said it IS root.

if (is_dir($imageDirectory)) {
    $files = scandir($imageDirectory);
    
    foreach ($files as $file) {
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        
        if (in_array($extension, $allowedExtensions)) {
            // Get image dimensions
            $filePath = $imageDirectory . '/' . $file;
            $dimensions = getimagesize($filePath);
            
            // Determine category
            $category = 'app'; // Default category
            if (strpos($file, 'nature') !== false) $category = 'filter-app';
            elseif (strpos($file, 'urban') !== false) $category = 'filter-product';
            elseif (strpos($file, 'travel') !== false) $category = 'filter-branding';
            elseif (strpos($file, 'portrait') !== false) $category = 'filter-books';
            
            // Construct Absolute URL
            // Assuming script is at root, file is at root.
            // If script is at https://domain.com/photos.php, image is https://domain.com/image.jpg
            $imageUrl = $baseUrl . '/' . $file;

            $images[] = [
                'src' => $imageUrl,
                'title' => pathinfo($file, PATHINFO_FILENAME),
                'category' => $category,
                'width' => $dimensions[0] ?? 0,
                'height' => $dimensions[1] ?? 0
            ];
        }
    }
} else {
    echo json_encode(['error' => 'Directory not found']);
    exit;
}

echo json_encode($images);
?>
