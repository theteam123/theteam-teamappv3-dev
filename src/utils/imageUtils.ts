import { GeolocationData, WatermarkField } from './formUtils';

interface GeolocationField {
  type: 'lat' | 'lng' | 'address';
  value: string;
}

interface WatermarkOptions {
  geoLocationFields: GeolocationData[];
  watermarkFields?: WatermarkField[];
}

export const addWatermark = async (imageFile: File, options: WatermarkOptions): Promise<File> => {
  console.log('Adding watermark with options:', options);
  if (options.geoLocationFields.length === 0 && (!options.watermarkFields || options.watermarkFields.length === 0)) {
    return imageFile;
  }

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

      // Configure watermark style
      ctx.font = '18px monospace';
      
      // Helper function to wrap text
      const wrapText = (text: string, maxWidth: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        return lines;
      };

      // Calculate total height needed for all watermarks
      const hasGeoFields = options.geoLocationFields.length > 0;
      const hasCustomFields = options.watermarkFields && options.watermarkFields.length > 0;
      const lineHeight = 25; // Height per line of text
      const textPadding = 15; // Padding from top/bottom of bar
      const leftPadding = 10;
      const maxTextWidth = canvas.width - (leftPadding * 2); // Maximum width for text
      
      // Find geolocation fields
      const latField = options.geoLocationFields.find(f => f.type === 'lat');
      const lngField = options.geoLocationFields.find(f => f.type === 'lng');
      const addressField = options.geoLocationFields.find(f => f.type === 'address');

      // Calculate heights for top and bottom bars
      let topBarHeight = 0;
      let bottomBarHeight = 0;

      // Calculate top bar height (for geolocation)
      if (hasGeoFields && latField && lngField) {
        topBarHeight = lineHeight * 2 + textPadding * 2; // Two lines for lat/lng
      }

      // Calculate bottom bar height
      if (hasCustomFields) {
        bottomBarHeight += (options.watermarkFields?.length || 0) * lineHeight;
      }
      if (addressField) {
        // Calculate how many lines the address will take
        const addressLines = wrapText(`Address: ${addressField.value}`, maxTextWidth);
        bottomBarHeight += lineHeight * addressLines.length;
      }
      bottomBarHeight += lineHeight; // For timestamp
      bottomBarHeight += textPadding * 2; // Add padding

      // Draw semi-transparent black bars
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      if (topBarHeight > 0) {
        ctx.fillRect(0, 0, canvas.width, topBarHeight);
      }
      if (bottomBarHeight > 0) {
        ctx.fillRect(0, canvas.height - bottomBarHeight, canvas.width, bottomBarHeight);
      }

      // Draw text in white
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      // Draw geolocation data in top bar
      if (hasGeoFields && latField && lngField) {
        ctx.fillText(`Lat: ${latField.value}`, leftPadding, textPadding + lineHeight/2);
        ctx.fillText(`Lng: ${lngField.value}`, leftPadding, textPadding + lineHeight * 1.5);
      }

      // Draw custom fields and address in bottom bar
      let currentY = canvas.height - bottomBarHeight + textPadding + lineHeight/2;

      // Draw custom watermark fields first
      if (hasCustomFields && options.watermarkFields) {
        options.watermarkFields.forEach(field => {
          const lines = wrapText(`${field.label}: ${field.value}`, maxTextWidth);
          lines.forEach(line => {
            ctx.fillText(line, leftPadding, currentY);
            currentY += lineHeight;
          });
        });
      }

      // Draw address if available
      if (addressField) {
        const addressLines = wrapText(`Address: ${addressField.value}`, maxTextWidth);
        addressLines.forEach(line => {
          ctx.fillText(line, leftPadding, currentY);
          currentY += lineHeight;
        });
      }

      // Draw timestamp last
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
      ctx.fillText(`Timestamp: ${timestamp}`, leftPadding, currentY);

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