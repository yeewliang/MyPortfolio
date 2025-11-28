# Image Optimization Tools Usage

## 1. Python Optimization Script (`optimize_images.py`)

This script resizes images and converts them to AVIF, WebP, and JPG formats.

### Setup
1.  Install dependencies:
    ```bash
    pip install Pillow pillow-avif-plugin
    ```
2.  Create a folder named `raw_images` in the same directory as the script.
3.  Place your high-resolution images in `raw_images`.

### Running
Run the script:
```bash
python optimize_images.py
```
The optimized images will be saved in the `ready_to_upload` folder. You can then upload these to your NAS.

## 2. React Component (`NasImage.jsx`)

This component loads the optimized images from your NAS.

### Environment Variable
Ensure you have the `VITE_NAS_BASE_URL` set in your `.env` file:
```
VITE_NAS_BASE_URL=https://assets.weiliangyee.dev
```

### Usage Example

```jsx
import React from 'react';
import NasImage from './components/NasImage';

const PhotographyGallery = () => {
  return (
    <div className="gallery-grid">
      <NasImage
        folder="photography/landscape"
        filename="mountain-sunset" // Do not include extension
        alt="Sunset over the mountains"
        width={800}
        height={600}
        className="gallery-item"
      />
      
      <NasImage
        folder="photography/urban"
        filename="city-lights"
        alt="City lights at night"
        width={800}
        height={600}
        className="gallery-item"
      />
    </div>
  );
};

export default PhotographyGallery;
```
