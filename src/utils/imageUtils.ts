import { GeolocationData, WatermarkField } from './formUtils';
import { formatInAppTimezone, toAppTimezoneISO } from './timezone';

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

      // Helper function to draw wrapped text and return the next Y position
      const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
        const lines = wrapText(text, maxWidth);
        lines.forEach((line, index) => {
          ctx.fillText(line, x, y + (index * lineHeight));
        });
        return y + (lines.length * lineHeight);
      };

      // Calculate dimensions and spacing
      const lineHeight = 25; // Height per line of text
      const textPadding = 15; // Padding from top/bottom of bar
      const leftPadding = 10;
      const maxTextWidth = canvas.width - (leftPadding * 2); // Maximum width for text
      
      // Find geolocation fields
      const latField = options.geoLocationFields.find(f => f.type === 'lat');
      const lngField = options.geoLocationFields.find(f => f.type === 'lng');
      const addressField = options.geoLocationFields.find(f => f.type === 'address');

      // Calculate heights for top and bottom bars
      let topBarHeight = textPadding * 2; // Start with padding
      let bottomBarHeight = textPadding * 2; // Start with padding

      // Calculate space needed for each text element
      if (latField && lngField) {
        const latLines = wrapText(`Lat: ${latField.value}`, maxTextWidth).length;
        const lngLines = wrapText(`Lng: ${lngField.value}`, maxTextWidth).length;
        topBarHeight += (latLines + lngLines) * lineHeight;
      }

      if (options.watermarkFields?.length) {
        options.watermarkFields.forEach(field => {
          const lines = wrapText(`${field.label}: ${field.value}`, maxTextWidth).length;
          bottomBarHeight += lines * lineHeight;
        });
      }

      if (addressField) {
        const addressLines = wrapText(`Address: ${addressField.value}`, maxTextWidth).length;
        bottomBarHeight += addressLines * lineHeight;
      }

      // Add space for timestamp (in Australia/Sydney timezone)
      const timestamp = formatInAppTimezone(new Date(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const timestampLines = wrapText(`Timestamp: ${timestamp}`, maxTextWidth).length;
      bottomBarHeight += timestampLines * lineHeight;

      // Draw semi-transparent black bars
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      if (topBarHeight > textPadding * 2) {
        ctx.fillRect(0, 0, canvas.width, topBarHeight);
      }
      if (bottomBarHeight > textPadding * 2) {
        ctx.fillRect(0, canvas.height - bottomBarHeight, canvas.width, bottomBarHeight);
      }

      // Draw text in white
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      // Draw geolocation data in top bar
      let currentY = textPadding + lineHeight/2;
      if (latField && lngField) {
        currentY = drawWrappedText(`Lat: ${latField.value}`, leftPadding, currentY, maxTextWidth, lineHeight);
        currentY = drawWrappedText(`Lng: ${lngField.value}`, leftPadding, currentY, maxTextWidth, lineHeight);
      }

      // Start drawing bottom content
      currentY = canvas.height - bottomBarHeight + textPadding + lineHeight/2;

      // Draw custom watermark fields
      if (options.watermarkFields?.length) {
        options.watermarkFields.forEach(field => {
          currentY = drawWrappedText(`${field.label}: ${field.value}`, leftPadding, currentY, maxTextWidth, lineHeight);
        });
      }

      // Draw address if available
      if (addressField) {
        currentY = drawWrappedText(`Address: ${addressField.value}`, leftPadding, currentY, maxTextWidth, lineHeight);
      }

      // Draw timestamp
      drawWrappedText(`Timestamp: ${timestamp}`, leftPadding, currentY, maxTextWidth, lineHeight);

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

interface WatermarkDownloadOptions {
  file: File;
  fieldname: string;
  docTypeId: string;
}

export const downloadWatermarkedFile = (options: WatermarkDownloadOptions) => {
  const { file, fieldname, docTypeId } = options;
  const downloadUrl = URL.createObjectURL(file);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = `watermarked_${fieldname}_${docTypeId}_${toAppTimezoneISO().replace(/[:.]/g, '-')}.jpg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadUrl);
};

export const downloadWatermarkedFiles = (files: WatermarkDownloadOptions[]) => {
  files.forEach(fileOptions => {
    downloadWatermarkedFile(fileOptions);
  });
}; 