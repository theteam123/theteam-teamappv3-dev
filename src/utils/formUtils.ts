interface DocTypeField {
  fieldname: string;
  label: string;
  fieldtype: string;
  reqd: number;
  options?: string;
  hidden?: number;
  depends_on?: string;
  parent?: string;
  description?: string;
  tab_id?: string;
}

export interface GeolocationData {
  fieldname: string;
  label: string;
  value: string;
  type: 'lat' | 'lng' | 'address';
}

export interface WatermarkField {
  fieldname: string;
  label: string;
  value: string;
}

export interface WatermarkConfig {
  imageFieldName: string;
  fields: WatermarkField[];
}

export const initializeWatermarkFields = (fields: DocTypeField[], formData: Record<string, any> = {}): WatermarkConfig[] => {
  const watermarkConfigs: WatermarkConfig[] = [];

  // Find all image fields with [camera] tag
  const imageFields = fields.filter(field => 
    field.fieldtype === 'Attach Image' && 
    field.label?.includes('[camera]') &&
    field.description?.includes('watermarks-fields:')
  );

  imageFields.forEach(imageField => {
    // Extract field names from description
    const match = imageField.description?.match(/watermarks-fields:([\w\s,]+)/);
    if (!match) return;

    // Get the comma-separated field names and trim each one
    const fieldNames = match[1].split(',').map(name => name.trim());

    // Find the corresponding fields and their values
    const watermarkFields = fieldNames.map(fieldName => {
      // Find field by checking if its fieldname matches
      const field = fields.find(f => f.fieldname === fieldName);

      if (!field) {
        return null;
      }

      // Get the current value from formData
      const currentValue = formData[field.fieldname];

      return {
        fieldname: field.fieldname,
        label: field.label.replace(/\[.*?\]/g, '').trim(), // Clean label for display
        value: currentValue?.toString() || ''
      };
    })
    .filter((field): field is WatermarkField => field !== null); // Remove any fields that weren't found

    if (watermarkFields.length > 0) {
      watermarkConfigs.push({
        imageFieldName: imageField.fieldname,
        fields: watermarkFields
      });
    }
  });

  return watermarkConfigs;
};

export const initializeGeolocationFields = (fields: DocTypeField[], formData: Record<string, any> = {}): GeolocationData[] => {
  const geoFields: GeolocationData[] = [];
  
  fields.forEach(field => {
    if (field.fieldtype === 'Data') {
      const match = field.label.match(/\[geolocation-(.*?)\]/);
      if (match) {
        const type = match[1] as 'lat' | 'lng' | 'address';
        geoFields.push({
          fieldname: field.fieldname,
          label: field.label.replace(/\[.*?\]/g, '').trim(),
          value: formData[field.fieldname]?.toString() || '',
          type
        });
      }
    }
  });
  
  return geoFields;
};

export interface DocField {
  fieldname: string;
  label: string;
  fieldtype: string;
  in_standard_filter: number;
  [key: string]: any; // for other properties that might be present
}

export const initializeFormFilter = (fields: DocField[]): DocField[] => {
  return fields.filter(field => field.in_standard_filter === 1);
};

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Creates a debounced search function with minimum character limit
 * 
 * @param searchFunc - The search function to call
 * @param wait - The number of milliseconds to delay
 * @param minLength - Minimum characters required before triggering search
 * @returns A debounced search function
 */
export const createDebouncedSearch = (
  searchFunc: () => void,
  wait: number = 300,
  minLength: number = 2
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (searchValue: string) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // If search is cleared or too short, trigger immediate search
    if (!searchValue || searchValue.length < minLength) {
      searchFunc();
      return;
    }
    
    // Debounce search for longer queries
    timeout = setTimeout(() => {
      searchFunc();
    }, wait);
  };
}; 