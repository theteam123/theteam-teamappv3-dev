/**
 * DocType Generator Service
 * Generates comprehensive Frappe DocType JSON files and HTML mockups
 * Based on TheTeam App v3 design system specifications
 */

/**
 * Generate DocType JSON and HTML mockup from business requirements
 * @param {Object} requirements - Business requirements object
 * @returns {Object} Generated output with DocType JSON, HTML mockup, and notes
 */
export const generateDocTypeFromRequirements = async (requirements) => {
  try {
    // Generate the main DocType
    const docType = generateDocTypeJSON(requirements);
    
    // Generate child DocTypes if needed
    const childDocTypes = generateChildDocTypes(requirements);
    
    // Generate HTML mockup
    const htmlMockup = generateHTMLMockup(requirements, docType);
    
    // Generate implementation notes
    const implementationNotes = generateImplementationNotes(requirements, docType);
    
    return {
      docType,
      childDocTypes: childDocTypes.length > 0 ? childDocTypes : undefined,
      htmlMockup,
      implementationNotes
    };
  } catch (error) {
    console.error('DocType generation failed:', error);
    throw new Error(`DocType generation failed: ${error.message}`);
  }
};

/**
 * Generate main DocType JSON structure
 * @param {Object} requirements - Business requirements
 * @returns {Object} DocType JSON structure
 */
const generateDocTypeJSON = (requirements) => {
  const fields = [];
  let idx = 1;

  // Add naming field if needed
  if (requirements.customNaming) {
    fields.push({
      fieldname: "naming_series",
      label: "Series",
      fieldtype: "Select",
      options: `${requirements.docTypeName.toUpperCase()}-YYYY-`,
      default: `${requirements.docTypeName.toUpperCase()}-YYYY-`,
      reqd: 1,
      in_list_view: 1,
      idx: idx++
    });
  }

  // Add basic info section
  if (requirements.fields.length > 0) {
    fields.push({
      fieldname: "basic_information_section",
      label: "Basic Information",
      fieldtype: "Section Break",
      idx: idx++
    });

    // Add all custom fields
    requirements.fields.forEach(field => {
      const fieldDef = {
        fieldname: generateFieldname(field.label),
        label: field.label,
        fieldtype: field.fieldtype,
        reqd: field.reqd || 0,
        idx: idx++
      };

      // Add field-specific options
      if (field.fieldtype === 'Select' && field.options) {
        fieldDef.options = field.options.split('\n').join('\n');
      }

      if (field.fieldtype === 'Link') {
        fieldDef.options = field.options || 'User';
      }

      if (field.fieldtype === 'Dynamic Link') {
        // Dynamic Link requires a companion Link field
        const referenceField = {
          fieldname: `${generateFieldname(field.label)}_doctype`,
          label: `${field.label} Type`,
          fieldtype: "Link",
          options: "DocType",
          reqd: field.reqd || 0,
          idx: idx++
        };
        fields.push(referenceField);
        fieldDef.options = referenceField.fieldname;
      }

      if (field.fieldtype === 'Table') {
        const childTableName = `${requirements.docTypeName} ${field.label}`;
        fieldDef.options = childTableName;
      }

      // Mobile-specific field enhancements
      if (field.fieldtype === 'Attach Image') {
        fieldDef.options = {
          max_file_size: 5242880, // 5MB
          allowed_file_types: ['.jpg', '.jpeg', '.png', '.gif']
        };
      }

      if (field.fieldtype === 'Geolocation') {
        fieldDef.description = 'GPS coordinates will be captured automatically on mobile devices';
      }

      fields.push(fieldDef);
    });
  }

  // Add child tables
  requirements.childTables.forEach(childTable => {
    fields.push({
      fieldname: generateFieldname(childTable.name),
      label: childTable.name,
      fieldtype: "Table",
      options: `${requirements.docTypeName} ${childTable.name}`,
      reqd: 0,
      idx: idx++
    });
  });

  // Add mobile features section if any mobile features are selected
  const mobileFeatures = requirements.mobileFeatures;
  if (mobileFeatures.camera || mobileFeatures.gps || mobileFeatures.signature || mobileFeatures.offline) {
    fields.push({
      fieldname: "mobile_features_section",
      label: "Mobile Features",
      fieldtype: "Section Break",
      collapsible: 1,
      idx: idx++
    });

    if (mobileFeatures.camera) {
      fields.push({
        fieldname: "captured_images",
        label: "Captured Images",
        fieldtype: "Table",
        options: `${requirements.docTypeName} Images`,
        description: "Images captured using mobile camera",
        idx: idx++
      });
    }

    if (mobileFeatures.gps) {
      fields.push({
        fieldname: "location",
        label: "Location",
        fieldtype: "Geolocation",
        description: "Current GPS location",
        idx: idx++
      });
    }

    if (mobileFeatures.signature) {
      fields.push({
        fieldname: "digital_signature",
        label: "Digital Signature",
        fieldtype: "Signature",
        description: "Digital signature for verification",
        idx: idx++
      });
    }
  }

  // Add timestamps section
  fields.push({
    fieldname: "timestamps_section",
    label: "Timestamps",
    fieldtype: "Section Break",
    collapsible: 1,
    idx: idx++
  });

  fields.push({
    fieldname: "created_by_user",
    label: "Created By",
    fieldtype: "Link",
    options: "User",
    read_only: 1,
    default: "user",
    idx: idx++
  });

  // Create the main DocType structure
  const docTypeStructure = {
    name: requirements.docTypeName,
    creation: new Date().toISOString(),
    modified: new Date().toISOString(),
    modified_by: "Administrator",
    owner: "Administrator",
    doctype: "DocType",
    module: requirements.module || "Custom",
    custom: 1,
    is_submittable: 1,
    is_tree: 0,
    autoname: "naming_series:",
    description: requirements.mainPurpose || `${requirements.docTypeName} management system`,
    title_field: fields.find(f => f.fieldtype === 'Data')?.fieldname || "name",
    search_fields: getSearchFields(fields),
    fields: fields,
    permissions: generateDefaultPermissions(),
    __islocal: 1,
    __unsaved: 1
  };

  return docTypeStructure;
};

/**
 * Generate child DocTypes for tables
 * @param {Object} requirements - Business requirements
 * @returns {Array} Array of child DocType structures
 */
const generateChildDocTypes = (requirements) => {
  const childDocTypes = [];

  // Generate child DocTypes for custom child tables
  requirements.childTables.forEach(childTable => {
    const fields = [];
    let idx = 1;

    // Add parent link
    fields.push({
      fieldname: "parent",
      label: "Parent",
      fieldtype: "Link",
      options: requirements.docTypeName,
      hidden: 1,
      idx: idx++
    });

    fields.push({
      fieldname: "parentfield",
      label: "Parent Field",
      fieldtype: "Data",
      hidden: 1,
      idx: idx++
    });

    fields.push({
      fieldname: "parenttype",
      label: "Parent Type",
      fieldtype: "Link",
      options: "DocType",
      hidden: 1,
      idx: idx++
    });

    // Add custom fields
    childTable.fields.forEach(field => {
      const fieldDef = {
        fieldname: generateFieldname(field.label),
        label: field.label,
        fieldtype: field.fieldtype,
        reqd: field.reqd || 0,
        in_list_view: 1,
        idx: idx++
      };

      if (field.fieldtype === 'Select' && field.options) {
        fieldDef.options = field.options;
      }

      fields.push(fieldDef);
    });

    const childDocType = {
      name: `${requirements.docTypeName} ${childTable.name}`,
      creation: new Date().toISOString(),
      modified: new Date().toISOString(),
      modified_by: "Administrator",
      owner: "Administrator",
      doctype: "DocType",
      module: requirements.module || "Custom",
      custom: 1,
      istable: 1,
      description: `Child table for ${requirements.docTypeName} - ${childTable.name}`,
      fields: fields,
      permissions: [],
      __islocal: 1,
      __unsaved: 1
    };

    childDocTypes.push(childDocType);
  });

  // Add mobile image table if camera feature is enabled
  if (requirements.mobileFeatures.camera) {
    const imageFields = [
      {
        fieldname: "parent",
        label: "Parent",
        fieldtype: "Link",
        options: requirements.docTypeName,
        hidden: 1,
        idx: 1
      },
      {
        fieldname: "parentfield",
        label: "Parent Field",
        fieldtype: "Data",
        hidden: 1,
        idx: 2
      },
      {
        fieldname: "parenttype",
        label: "Parent Type",
        fieldtype: "Link",
        options: "DocType",
        hidden: 1,
        idx: 3
      },
      {
        fieldname: "image",
        label: "Image",
        fieldtype: "Attach Image",
        in_list_view: 1,
        reqd: 1,
        idx: 4
      },
      {
        fieldname: "description",
        label: "Description",
        fieldtype: "Text",
        in_list_view: 1,
        idx: 5
      },
      {
        fieldname: "captured_at",
        label: "Captured At",
        fieldtype: "Datetime",
        default: "now",
        read_only: 1,
        in_list_view: 1,
        idx: 6
      }
    ];

    const imageDocType = {
      name: `${requirements.docTypeName} Images`,
      creation: new Date().toISOString(),
      modified: new Date().toISOString(),
      modified_by: "Administrator",
      owner: "Administrator",
      doctype: "DocType",
      module: requirements.module || "Custom",
      custom: 1,
      istable: 1,
      description: `Image attachments for ${requirements.docTypeName}`,
      fields: imageFields,
      permissions: [],
      __islocal: 1,
      __unsaved: 1
    };

    childDocTypes.push(imageDocType);
  }

  return childDocTypes;
};

/**
 * Generate HTML mockup with TheTeam App v3 design system
 * @param {Object} requirements - Business requirements
 * @param {Object} docType - Generated DocType structure
 * @returns {String} Complete HTML mockup
 */
const generateHTMLMockup = (requirements, docType) => {
  const formFields = docType.fields.filter(field => 
    !field.hidden && !['Section Break', 'Column Break'].includes(field.fieldtype)
  );

  const mockupHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${requirements.docTypeName} - TheTeam App v3</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .theteam-logo { height: 40px; width: auto; object-fit: contain; }
        .theteam-logo-footer { height: 16px; width: auto; display: inline; }
        .btn-primary {
            background-color: #22c55e;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .btn-primary:hover { background-color: #16a34a; }
        .btn-secondary {
            background-color: #f3f4f6;
            color: #374151;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            border: 1px solid #d1d5db;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-secondary:hover { background-color: #e5e7eb; }
        .form-input {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
            outline: none;
            border-color: #22c55e;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
        .form-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            background-color: white;
        }
        .form-textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
        }
        .card {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .table { width: 100%; border-collapse: collapse; }
        .table th {
            background-color: #f9fafb;
            padding: 12px;
            text-align: left;
            font-weight: 500;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
        }
        .table td {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
        }
        .table tr:hover { background-color: #f9fafb; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div class="flex items-center px-4 py-3">
            <button class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
            <div class="flex-1 flex justify-center">
                <img src="https://i.ibb.co/v42vBNsJ/TeamLogo.png" alt="TheTeam" class="theteam-logo">
            </div>
            <button class="btn-primary">Support</button>
        </div>
    </header>

    <!-- Main Content -->
    <main class="pt-16 pb-20">
        <div class="max-w-4xl mx-auto p-6">
            <!-- Page Header -->
            <div class="mb-6">
                <div class="flex items-center gap-4">
                    <button class="text-gray-600 hover:text-gray-900">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">New ${requirements.docTypeName}</h1>
                        <p class="text-sm text-gray-500 mt-1">${requirements.mainPurpose || 'Create a new record'}</p>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <form class="space-y-6">
                <div class="card">
                    ${generateFormSections(formFields, requirements)}
                    
                    <!-- Child Tables -->
                    ${generateChildTableSections(requirements)}
                    
                    <!-- Mobile Features -->
                    ${generateMobileFeaturesSections(requirements)}
                    
                    <!-- Form Actions -->
                    <div class="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button type="button" class="btn-secondary">Cancel</button>
                        <button type="submit" class="btn-primary">Save ${requirements.docTypeName}</button>
                    </div>
                </div>
            </form>
        </div>
    </main>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div class="text-center text-sm text-gray-500">
            Powered by <img src="https://i.ibb.co/v42vBNsJ/TeamLogo.png" alt="TheTeam" class="theteam-logo-footer">
        </div>
    </footer>

    <script>
        // Form validation
        function validateForm() {
            const requiredFields = document.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('border-red-500');
                    isValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });
            
            return isValid;
        }

        // Child table management
        function addTableRow(tableName) {
            console.log('Adding row to', tableName);
            // Implementation for adding table rows
        }

        function removeTableRow(tableName, index) {
            console.log('Removing row', index, 'from', tableName);
            // Implementation for removing table rows
        }

        // Mobile features simulation
        function captureImage() {
            alert('Camera interface would open here on mobile devices');
        }

        function getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    document.getElementById('location-display').textContent = \`\${lat}, \${lng}\`;
                });
            }
        }

        // Form submission
        document.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                alert('${requirements.docTypeName} would be saved to ERPNext');
            } else {
                alert('Please fill in all required fields');
            }
        });
    </script>
</body>
</html>`;

  return mockupHTML;
};

/**
 * Generate form sections HTML
 * @param {Array} fields - Form fields
 * @param {Object} requirements - Business requirements
 * @returns {String} Form sections HTML
 */
const generateFormSections = (fields, requirements) => {
  let sectionsHTML = '';
  let currentSection = '';
  
  fields.forEach(field => {
    if (field.fieldtype === 'Section Break') {
      if (currentSection) {
        sectionsHTML += '</div>';
      }
      sectionsHTML += `
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">${field.label}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      `;
      currentSection = field.label;
    } else {
      sectionsHTML += generateFieldHTML(field);
    }
  });
  
  if (currentSection) {
    sectionsHTML += '</div></div>';
  }
  
  return sectionsHTML;
};

/**
 * Generate HTML for individual form field
 * @param {Object} field - Field definition
 * @returns {String} Field HTML
 */
const generateFieldHTML = (field) => {
  const requiredAttr = field.reqd ? 'required' : '';
  const requiredLabel = field.reqd ? ' *' : '';
  
  let fieldHTML = `
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        ${field.label}${requiredLabel}
      </label>
  `;

  switch (field.fieldtype) {
    case 'Data':
    case 'Int':
    case 'Float':
      const inputType = field.fieldtype === 'Int' || field.fieldtype === 'Float' ? 'number' : 'text';
      fieldHTML += `<input type="${inputType}" class="form-input" placeholder="Enter ${field.label}" ${requiredAttr}>`;
      break;
      
    case 'Date':
      fieldHTML += `<input type="date" class="form-input" ${requiredAttr}>`;
      break;
      
    case 'Datetime':
      fieldHTML += `<input type="datetime-local" class="form-input" ${requiredAttr}>`;
      break;
      
    case 'Time':
      fieldHTML += `<input type="time" class="form-input" ${requiredAttr}>`;
      break;
      
    case 'Select':
      fieldHTML += `<select class="form-select" ${requiredAttr}>`;
      fieldHTML += `<option value="">Select ${field.label}</option>`;
      if (field.options) {
        field.options.split('\n').forEach(option => {
          if (option.trim()) {
            fieldHTML += `<option value="${option.trim()}">${option.trim()}</option>`;
          }
        });
      }
      fieldHTML += '</select>';
      break;
      
    case 'Text':
      fieldHTML += `<textarea class="form-textarea" placeholder="Enter ${field.label}" ${requiredAttr}></textarea>`;
      break;
      
    case 'Check':
      fieldHTML += `
        <div class="flex items-center">
          <input type="checkbox" class="mr-2" ${requiredAttr}>
          <span class="text-sm text-gray-600">Enable ${field.label}</span>
        </div>`;
      break;
      
    case 'Attach Image':
      fieldHTML += `
        <div class="space-y-2">
          <input type="file" accept="image/*" class="form-input" ${requiredAttr}>
          <button type="button" onclick="captureImage()" class="btn-secondary text-sm">
            📷 Capture with Camera
          </button>
        </div>`;
      break;
      
    case 'Geolocation':
      fieldHTML += `
        <div class="space-y-2">
          <input type="text" class="form-input" placeholder="GPS coordinates" readonly>
          <button type="button" onclick="getCurrentLocation()" class="btn-secondary text-sm">
            📍 Get Current Location
          </button>
          <div id="location-display" class="text-sm text-gray-600"></div>
        </div>`;
      break;
      
    case 'Signature':
      fieldHTML += `
        <div class="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-32 flex items-center justify-center">
          <span class="text-gray-500">Digital signature area - Touch to sign on mobile</span>
        </div>`;
      break;
      
    case 'Link':
      fieldHTML += `<select class="form-select" ${requiredAttr}>`;
      fieldHTML += `<option value="">Select ${field.label}</option>`;
      fieldHTML += `<option value="sample1">Sample ${field.options || 'Record'} 1</option>`;
      fieldHTML += `<option value="sample2">Sample ${field.options || 'Record'} 2</option>`;
      fieldHTML += '</select>';
      break;
      
    case 'Dynamic Link':
      fieldHTML += `
        <div class="space-y-2">
          <select class="form-select" onchange="updateDynamicLinkOptions(this)">
            <option value="">Select Document Type</option>
            <option value="User">User</option>
            <option value="Customer">Customer</option>
            <option value="Supplier">Supplier</option>
          </select>
          <select class="form-select" ${requiredAttr}>
            <option value="">First select document type above</option>
          </select>
        </div>`;
      break;
      
    default:
      fieldHTML += `<input type="text" class="form-input" placeholder="Enter ${field.label}" ${requiredAttr}>`;
  }

  fieldHTML += '</div>';
  return fieldHTML;
};

/**
 * Generate child table sections
 * @param {Object} requirements - Business requirements
 * @returns {String} Child table HTML
 */
const generateChildTableSections = (requirements) => {
  let tablesHTML = '';
  
  requirements.childTables.forEach(childTable => {
    tablesHTML += `
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-700">${childTable.name}</h3>
          <button type="button" onclick="addTableRow('${childTable.name}')" class="btn-primary text-sm">
            Add Row
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                ${childTable.fields.map(field => `<th>${field.label}</th>`).join('')}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="${childTable.fields.length + 1}" class="text-center text-gray-500 py-8">
                  No rows added yet. Click "Add Row" to get started.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
  
  return tablesHTML;
};

/**
 * Generate mobile features sections
 * @param {Object} requirements - Business requirements
 * @returns {String} Mobile features HTML
 */
const generateMobileFeaturesSections = (requirements) => {
  const mobileFeatures = requirements.mobileFeatures;
  if (!mobileFeatures.camera && !mobileFeatures.gps && !mobileFeatures.signature) {
    return '';
  }
  
  let mobileFeaturesHTML = `
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Mobile Features</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  `;

  if (mobileFeatures.camera) {
    mobileFeaturesHTML += `
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">Captured Images</label>
        <div class="border border-dashed border-gray-300 rounded-lg p-4 text-center">
          <button type="button" onclick="captureImage()" class="btn-primary">
            📷 Capture Image
          </button>
          <p class="text-sm text-gray-500 mt-2">Images will appear here after capture</p>
        </div>
      </div>
    `;
  }

  if (mobileFeatures.gps) {
    mobileFeaturesHTML += `
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
        <div class="space-y-2">
          <button type="button" onclick="getCurrentLocation()" class="btn-secondary w-full">
            📍 Get GPS Location
          </button>
          <div id="location-display" class="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            Location will appear here
          </div>
        </div>
      </div>
    `;
  }

  mobileFeaturesHTML += '</div></div>';
  return mobileFeaturesHTML;
};

/**
 * Generate implementation notes
 * @param {Object} requirements - Business requirements
 * @param {Object} docType - Generated DocType
 * @returns {String} Implementation notes HTML
 */
const generateImplementationNotes = (requirements, docType) => {
  return `
    <h3>Implementation Notes</h3>
    <p><strong>DocType Name:</strong> ${docType.name}</p>
    <p><strong>Module:</strong> ${docType.module}</p>
    <p><strong>Total Fields:</strong> ${docType.fields.length}</p>
    
    <h4>Deployment Instructions:</h4>
    <ol>
      <li>Import the DocType JSON file into your ERPNext instance via DocType List → Import</li>
      <li>Set appropriate permissions for user roles</li>
      <li>Customize the form layout if needed</li>
      <li>Test the form functionality on both desktop and mobile devices</li>
    </ol>
    
    <h4>Mobile Optimizations:</h4>
    <ul>
      ${requirements.mobileFeatures.camera ? '<li>Camera integration for image capture</li>' : ''}
      ${requirements.mobileFeatures.gps ? '<li>GPS location capture for geolocation fields</li>' : ''}
      ${requirements.mobileFeatures.signature ? '<li>Digital signature support</li>' : ''}
      ${requirements.mobileFeatures.offline ? '<li>Offline functionality enabled</li>' : ''}
    </ul>
    
    <h4>Field Types Used:</h4>
    <ul>
      ${[...new Set(docType.fields.map(f => f.fieldtype))].map(type => `<li>${type}</li>`).join('')}
    </ul>
  `;
};

/**
 * Helper Functions
 */

const generateFieldname = (label) => {
  return label.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 140);
};

const getSearchFields = (fields) => {
  const searchableFields = fields.filter(field => 
    ['Data', 'Text', 'Link'].includes(field.fieldtype) && 
    !field.hidden
  ).slice(0, 3);
  
  return searchableFields.map(field => field.fieldname).join(', ');
};

const generateDefaultPermissions = () => {
  return [
    {
      role: "System Manager",
      read: 1,
      write: 1,
      create: 1,
      delete: 1,
      submit: 1,
      cancel: 1,
      amend: 1
    },
    {
      role: "All",
      read: 1,
      write: 1,
      create: 1
    }
  ];
}; 