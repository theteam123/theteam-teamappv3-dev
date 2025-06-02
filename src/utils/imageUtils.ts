interface GeolocationField {
  type: 'lat' | 'lng' | 'address';
  value: string;
}

export const addWatermark = async (imageFile: File, geoLocationFields: GeolocationField[]): Promise<File> => {
  console.log('Adding watermark with geoLocationFields:', geoLocationFields);
  if (geoLocationFields.length === 0) return imageFile;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageFile);
        return;
      }

      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Find lat/lng values
      const latField = geoLocationFields.find(f => f.type === 'lat');
      const lngField = geoLocationFields.find(f => f.type === 'lng');
      const addressField = geoLocationFields.find(f => f.type === 'address');

      // Configure watermark style
      ctx.font = '18px monospace';
      
      // Draw semi-transparent black bars at top and bottom
      const barHeight = addressField ? 70 : 45; // Increased height for two lines when address exists
      const textPadding = 15; // Padding from top/bottom of bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, barHeight); // Top bar
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight); // Bottom bar

      // Draw text in white
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';

      // Top bar content (GPS coordinates)
      if (latField && lngField) {
        ctx.textAlign = 'left';
        const leftPadding = 10;
        ctx.fillText(`Lat: ${latField.value}`, leftPadding, textPadding);
        ctx.fillText(`Lng: ${lngField.value}`, leftPadding, barHeight - textPadding);
      }

      // Bottom bar content (Address and timestamp)
      ctx.textAlign = 'left';
      const now = new Date();
      const timestamp = now.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      if (addressField) {
        // Draw address on first line
        ctx.fillText(`Address: ${addressField.value}`, 10, canvas.height - barHeight + 20);
        // Draw timestamp on second line
        ctx.fillText(`Timestamp: ${timestamp}`, 10, canvas.height - barHeight + 50);
      } else {
        // Draw only timestamp centered vertically
        ctx.fillText(`Timestamp: ${timestamp}`, 10, canvas.height - barHeight/2);
      }

      // Convert canvas back to file
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(imageFile);
          return;
        }
        const watermarkedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
          lastModified: Date.now()
        });
        resolve(watermarkedFile);
      }, imageFile.type);
    };

    img.onerror = () => {
      resolve(imageFile);
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve(imageFile);
    };
    reader.readAsDataURL(imageFile);
  });
};

// Constants for image optimization
export const MAX_WIDTH = 1920;
export const MAX_HEIGHT = 1080;
export const JPEG_QUALITY = 0.8;

export const optimizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }
      
      if (height > MAX_HEIGHT) {
        width = (width * MAX_HEIGHT) / height;
        height = MAX_HEIGHT;
      }

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          // Create new file with same name but optimized content
          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => resolve(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}; 