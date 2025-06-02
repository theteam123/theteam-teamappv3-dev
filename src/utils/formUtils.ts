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

  console.log('fields:', fields);
  console.log('formData:', formData);
  console.log('imageFields:', imageFields);

  imageFields.forEach(imageField => {
    // Extract field names from description
    console.log('imageField Description:', imageField.description);
    const match = imageField.description?.match(/watermarks-fields:([\w\s,]+)/);
    if (!match) return;

    // Get the comma-separated field names and trim each one
    const fieldNames = match[1].split(',').map(name => name.trim());
    console.log('fieldNames:', fieldNames);

    // Find the corresponding fields and their values
    const watermarkFields = fieldNames.map(fieldName => {
      // Find field by checking if its fieldname matches
      const field = fields.find(f => f.fieldname === fieldName);

      if (!field) {
        console.log(`No field found for fieldName: "${fieldName}"`);
        return null;
      }

      // Get the current value from formData
      const currentValue = formData[field.fieldname];
      console.log(`Field: ${field.fieldname}, Current Value:`, currentValue);

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

  console.log('Final watermarkConfigs:', watermarkConfigs);
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