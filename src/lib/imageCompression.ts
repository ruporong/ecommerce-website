/**
 * Utility to compress and resize images client-side before uploading.
 * Reduces 5MB-10MB camera/phone photos to ~200-400KB WebP/JPEG in milliseconds,
 * completely preventing Vercel's 4.5MB FUNCTION_PAYLOAD_TOO_LARGE (413) error.
 */
export async function compressImage(
  file: File, 
  maxWidth = 1600, 
  maxHeight = 2000, 
  quality = 0.85
): Promise<File> {
  // If file is SVG or already small (< 300KB), return as is
  if (file.type === 'image/svg+xml' || file.size < 300 * 1024) {
    return file;
  }

  // Only compress images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file); // Keep original if compression didn't reduce size
            }
            const newName = file.name.replace(/\.[^.]+$/, '.webp');
            const compressedFile = new File([blob], newName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
