import os
from PIL import Image
import pillow_avif

# Configuration
INPUT_DIR = './raw_images'
OUTPUT_DIR = './ready_to_upload'
MAX_WIDTH = 1920

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def resize_image(img, max_width):
    width, height = img.size
    if width > max_width:
        ratio = max_width / width
        new_height = int(height * ratio)
        return img.resize((max_width, new_height), Image.Resampling.LANCZOS)
    return img

def process_images():
    ensure_dir(OUTPUT_DIR)
    
    if not os.path.exists(INPUT_DIR):
        print(f"Input directory '{INPUT_DIR}' does not exist. Please create it and add images.")
        return

    for filename in os.listdir(INPUT_DIR):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
            filepath = os.path.join(INPUT_DIR, filename)
            try:
                with Image.open(filepath) as img:
                    # Convert to RGB if necessary (e.g. for PNGs with transparency when saving as JPEG)
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                    
                    # Resize
                    img_resized = resize_image(img, MAX_WIDTH)
                    
                    base_name = os.path.splitext(filename)[0]
                    
                    # Save as AVIF
                    avif_path = os.path.join(OUTPUT_DIR, f"{base_name}.avif")
                    img_resized.save(avif_path, 'AVIF', quality=80)
                    print(f"Saved {avif_path}")
                    
                    # Save as WebP
                    webp_path = os.path.join(OUTPUT_DIR, f"{base_name}.webp")
                    img_resized.save(webp_path, 'WEBP', quality=80)
                    print(f"Saved {webp_path}")
                    
                    # Save as JPG
                    jpg_path = os.path.join(OUTPUT_DIR, f"{base_name}.jpg")
                    img_resized.save(jpg_path, 'JPEG', quality=85, optimize=True)
                    print(f"Saved {jpg_path}")
                    
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    process_images()
