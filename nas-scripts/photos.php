<?php
// photos.php - Host this on your Synology Web Station

// Configuration
$imageDirectory = './photos'; // Relative path to your photos folder
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Set headers
header('Content-Type: application/json');
// CORS Configuration
$allowedOriginPattern = '/^https?:\/\/([a-z0-9-]+\.)?weiliangyee\.dev$/';

if (isset($_SERVER['HTTP_ORIGIN']) && preg_match($allowedOriginPattern, $_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    // Optional: Handle unauthorized origin or just don't send the header
    // header("HTTP/1.1 403 Forbidden");
    // exit;
}

$images = [];

if (is_dir($imageDirectory)) {
    $files = scandir($imageDirectory);
    
    foreach ($files as $file) {
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        
        if (in_array($extension, $allowedExtensions)) {
            // Get image dimensions (optional, but good for masonry layout)
            $filePath = $imageDirectory . '/' . $file;
            $dimensions = getimagesize($filePath);
            
            // Determine category based on filename or folder structure
            // For this example, we'll assign a random category or parse it from the filename
            // Example filename: nature-mountain.jpg -> category: nature
            $category = 'app'; // Default category
            if (strpos($file, 'nature') !== false) $category = 'filter-app';
            elseif (strpos($file, 'urban') !== false) $category = 'filter-product';
            elseif (strpos($file, 'travel') !== false) $category = 'filter-branding';
            elseif (strpos($file, 'portrait') !== false) $category = 'filter-books';
            
            $images[] = [
                'src' => $imageDirectory . '/' . $file,
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
