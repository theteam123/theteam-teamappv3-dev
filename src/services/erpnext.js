import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { getCurrentToken } from './oauth';
import { getErpNextApiUrl } from '../utils/api';

// Get the current domain and environment
const currentDomain = window.location.hostname;
const isProduction = import.meta.env.PROD;

// Determine which ERPNext instance to use based on domain and environment
export const getErpNextConfig = () => {
  // Production environment
  if (isProduction) {
    if (currentDomain.includes('teamsite-taktec')) {
      return {
        baseURL: import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL
      };
    }
    return {
      baseURL: import.meta.env.VITE_ERPNEXT_API_URL
    };
  }
  
  // Development environment
  if (currentDomain.includes('teamsite-taktec')) {
    return {
      baseURL: import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL || 'http://taktec.theteam.net.au'
    };
  }
  return {
    baseURL: import.meta.env.VITE_ERPNEXT_API_URL || 'https://erp.theteam.net.au'
  };
};

const config = getErpNextConfig();

// Log configuration in development
if (!isProduction) {
  console.log('Current Environment:', isProduction ? 'Production' : 'Development');
  console.log('Current Domain:', currentDomain);
  console.log('Using API URL:', config.baseURL);
}

// Create axios instance with default config
const createAxiosInstance = () => {
  const apiUrl = getErpNextApiUrl();
  return axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
};

// Create axios instance with default config
const createAxiosInstanceWithFallback = () => {
  const apiUrl = getErpNextApiUrl();
  return axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
};

// Add request interceptor to add OAuth token
const erp = createAxiosInstance();
erp.interceptors.request.use(async (config) => {
  const token = await getCurrentToken();
  console.log('Request interceptor - Token:', token ? 'Present' : 'Missing');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Request headers:', config.headers);
  }
  return config;
});

// Add response interceptor for error handling
erp.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        // window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    // First clear any existing cookies and storage
    document.cookie = 'sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('authState');
    localStorage.removeItem('frappe_user');

    const loginData = {
      usr: email,
      pwd: password,
      device: 'desktop',
      cmd: 'login'
    };

    const loginResponse = await erp.post('/api/method/login', loginData);

    if (loginResponse.data.message === 'Logged In') {
      // Store the session ID and user ID in localStorage for persistence
      const sid = document.cookie.split(';').find(c => c.trim().startsWith('sid='));
      if (sid) {
        localStorage.setItem('frappe_sid', sid.split('=')[1].trim());
      }
      localStorage.setItem('frappe_user', email); // Store the user ID
      return loginResponse.data;
    } else {
      throw new Error('Login failed');
    }
  } catch (err) {
    console.error('Login failed:', err);
    throw err;
  }
};

// Metadata caching implementation
const metadataCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Cache management functions
const getCachedMetadata = (key) => {
  const cachedData = metadataCache.get(key);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }
  return null;
};

const setCachedMetadata = (key, data) => {
  metadataCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const invalidateMetadataCache = (key) => {
  metadataCache.delete(key);
};

// Persist cache to localStorage every 5 minutes
setInterval(() => {
  const cacheData = Array.from(metadataCache.entries());
  localStorage.setItem('metadataCache', JSON.stringify(cacheData));
}, 5 * 60 * 1000);

// Load cache from localStorage on startup
const loadCache = () => {
  try {
    const cached = localStorage.getItem('metadataCache');
    if (cached) {
      const cacheData = JSON.parse(cached);
      metadataCache.clear();
      cacheData.forEach(([key, value]) => {
        // Only load non-expired cache entries
        if (Date.now() - value.timestamp < CACHE_DURATION) {
          metadataCache.set(key, value);
        }
      });
    }
  } catch (error) {
    console.error('Error loading metadata cache:', error);
    // Clear potentially corrupted cache
    localStorage.removeItem('metadataCache');
  }
};

// Load cache on module initialization
loadCache();

export const getFormData = async (doctype, name) => {
  try {
    const cacheKey = `${doctype}-${name}`;
    const cachedData = getCachedMetadata(cacheKey);
    
    if (cachedData) {
      console.log('Using cached metadata for:', cacheKey);
      return cachedData;
    }

    console.log('Fetching fresh metadata for:', cacheKey);
    const response = await erp.get(`/api/resource/${doctype}/${name}`);
    setCachedMetadata(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching form data:', error.response?.data || error);
    throw error;
  }
};

// Add cache invalidation function to exports
export const clearMetadataCache = (doctype, name) => {
  const cacheKey = `${doctype}-${name}`;
  invalidateMetadataCache(cacheKey);
  console.log('Cleared metadata cache for:', cacheKey);
};

export const getFormList = async (doctype) => {
  try {
    const response = await erp.get(`/api/resource/${doctype}`);
    return response.data;
  } catch (error) {
    console.error('Error listing forms:', error.response?.data || error);
    throw error;
  }
};

export const getDocTypes = async (page = 1, pageSize = 20, search = '', category = '') => {
  try {
    // Create a cache key based on the request parameters
    const cacheKey = `doctypes-${page}-${pageSize}-${search}-${category}`;
    const cachedData = getCachedMetadata(cacheKey);
    
    if (cachedData) {
      console.log('Using cached DocTypes data for:', cacheKey);
      return cachedData;
    }

    console.log('Fetching fresh DocTypes data for:', cacheKey);
    const authStore = useAuthStore();
    const username = authStore.user?.name;
    console.log('Current user from auth store:', username);
    
    // Calculate start and end for pagination
    const limit_start = (page - 1) * pageSize;
    const limit_page_length = pageSize;

    // Build filters array
    const filters = [
      ['DocType', 'istable', '=', 0]
    ];
    
    // Add search filter if search term exists
    if (search) {
      filters.push(['DocType', 'name', 'like', `%${search}%`]);
    }
    
    // Add category filter if category is selected
    if (category) {
      filters.push(['DocType', 'module', '=', category]);
    }

    console.log('Using filters:', filters);

    // Get the current token
    const token = await getCurrentToken();
    console.log('API Request - Token:', token ? 'Present' : 'Missing');

    // First, get total count
    const countResponse = await erp.get('/api/method/frappe.client.get_count', {
      params: {
        doctype: 'DocType',
        filters: JSON.stringify(filters)
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const total = countResponse.data.message || 0;
    console.log('Total count:', total);

    // Then fetch the data
    const response = await erp.get('/api/method/frappe.client.get_list', {
      params: {
        doctype: 'DocType',
        fields: '["name", "module", "modified", "creation", "description", "fields"]',
        filters: JSON.stringify(filters),
        limit_start,
        limit_page_length,
        as_list: 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle different response formats
    let data = [];

    if (Array.isArray(response.data.message)) {
      data = response.data.message;
    } else if (response.data.data) {
      data = response.data.data;
    } else {
      console.warn('Unexpected response format:', response.data);
    }

    // Process each DocType to get document counts
    const docTypesWithCounts = await Promise.all(
      data.map(async (docType) => {
        try {
          let fields = [];
          try {
            if (docType.fields) {
              if (typeof docType.fields === 'string') {
                fields = JSON.parse(docType.fields);
              } else if (Array.isArray(docType.fields)) {
                fields = docType.fields;
              }
            }
          } catch (err) {
            console.warn(`Error parsing fields for ${docType.name}:`, err);
            fields = [];
          }

          // Get document count for this DocType
          let count = 0;
          try {
            const countResponse = await erp.get('/api/method/frappe.client.get_count', {
              params: {
                doctype: docType.name,
                filters: '[]'
              },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (countResponse.data && countResponse.data.message !== undefined) {
              count = Number(countResponse.data.message);
            }
          } catch (err) {
            // Handle 500 errors gracefully
            if (err.response?.status === 500) {
              console.warn(`Server error getting count for ${docType.name}, defaulting to 0`);
              count = 0;
            } else {
              console.error(`Error getting count for ${docType.name}:`, err);
              count = 0;
            }
          }

          // Map the DocType data with the count
          return {
            id: docType.name,
            name: docType.name,
            description: docType.description || '',
            module: docType.module || 'Other',
            fields: fields,
            updated_at: docType.modified || docType.modified_on || docType.updated_at || null,
            created_at: docType.creation || docType.created_on || docType.created_at || null,
            documents_count: count,
            modified: docType.modified,
            modified_on: docType.modified_on,
            creation: docType.creation,
            created_on: docType.created_on
          };
        } catch (err) {
          console.error(`Error processing DocType ${docType.name}:`, err);
          return {
            id: docType.name,
            name: docType.name,
            description: docType.description || '',
            module: docType.module || 'Other',
            fields: [],
            updated_at: docType.modified || docType.modified_on || docType.updated_at || null,
            created_at: docType.creation || docType.created_on || docType.created_at || null,
            documents_count: 0,
            modified: docType.modified,
            modified_on: docType.modified_on,
            creation: docType.creation,
            created_on: docType.created_on
          };
        }
      })
    );

    const result = {
      data: docTypesWithCounts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };

    // Cache the result
    setCachedMetadata(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error fetching document types:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Add a function to clear DocType cache
export const clearDocTypeCache = (page, pageSize, search, category) => {
  const cacheKey = `doctypes-${page}-${pageSize}-${search}-${category}`;
  invalidateMetadataCache(cacheKey);
  console.log('Cleared DocType cache for:', cacheKey);
};

// Update the existing functions to clear cache when modifying DocTypes
export const createDocType = async (data) => {
  try {
    const response = await erp.post('/api/resource/DocType', {
      data: data
    });
    // Clear all DocType caches after creating a new DocType
    metadataCache.forEach((value, key) => {
      if (key.startsWith('doctypes-')) {
        invalidateMetadataCache(key);
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating document type:', error.response?.data || error);
    throw error;
  }
};

export const updateDocType = async (name, data) => {
  try {
    const response = await erp.put(`/api/resource/DocType/${name}`, {
      data: data
    });
    // Clear all DocType caches after updating a DocType
    metadataCache.forEach((value, key) => {
      if (key.startsWith('doctypes-')) {
        invalidateMetadataCache(key);
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating document type:', error.response?.data || error);
    throw error;
  }
};

export const deleteDocType = async (name) => {
  try {
    const response = await erp.delete(`/api/resource/DocType/${name}`);
    // Clear all DocType caches after deleting a DocType
    metadataCache.forEach((value, key) => {
      if (key.startsWith('doctypes-')) {
        invalidateMetadataCache(key);
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting document type:', error.response?.data || error);
    throw error;
  }
};

export const getWebforms = async (page = 1, pageSize = 20, search = '', category = '') => {
  try {
    const authStore = useAuthStore();
    const username = authStore.user?.name;
    console.log('Current user from auth store:', username);
    
    // Calculate start and end for pagination
    const limit_start = (page - 1) * pageSize;
    const limit_page_length = pageSize;

    // Build filters array
    const filters = [];
    
    // Add search filter if search term exists
    if (search) {
      filters.push(['Web Form', 'title', 'like', `%${search}%`]);
    }
    
    // Add category filter if category is selected
    if (category) {
      filters.push(['Web Form', 'module', '=', category]);
    }

    console.log('Using filters:', filters);

    // Get the current token
    const token = await getCurrentToken();
    console.log('API Request - Token:', token ? 'Present' : 'Missing');

    // First, get total count
    const countResponse = await erp.get('/api/method/frappe.client.get_count', {
      params: {
        doctype: 'Web Form',
        filters: JSON.stringify(filters)
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const total = countResponse.data.message || 0;
    console.log('Total count:', total);

    // Then fetch the data with updated fields list
    const response = await erp.get('/api/method/frappe.client.get_list', {
      params: {
        doctype: 'Web Form',
        fields: JSON.stringify([
          "name", "title", "module", "modified", "creation", "route", 
          "is_standard", "doc_type", "success_url", "success_message", 
          "login_required", "allow_edit", "allow_multiple", 
          "apply_document_permissions"
        ]),
        filters: JSON.stringify(filters),
        limit_start,
        limit_page_length,
        as_list: 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Handle different response formats
    let data = [];

    if (Array.isArray(response.data.message)) {
      data = response.data.message;
    } else if (response.data.data) {
      data = response.data.data;
    } else {
      console.warn('Unexpected response format:', response.data);
    }

    // Post-process the forms to check permissions
    const processedForms = await Promise.all(
      data.map(async (form) => {
        let hasPermission = true;
        if (form.apply_document_permissions) {
          hasPermission = await checkDocTypePermission(form.doc_type);
        }
        return {
          ...form,
          has_permission: hasPermission
        };
      })
    );

    // Filter out forms without permission
    const accessibleForms = processedForms.filter(form => form.has_permission);

    return {
      data: accessibleForms,
      total: accessibleForms.length,
      page,
      pageSize,
      totalPages: Math.ceil(accessibleForms.length / pageSize)
    };
  } catch (error) {
    console.error('Error fetching webforms:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const createForm = async (webFormName, data) => {
  // 1. Fetch the Web Form to get the DocType
  const webFormResponse = await fetch(`${getErpNextApiUrl()}/api/resource/Web Form/${webFormName}`, {
    headers: {
      'Authorization': `Bearer ${await getCurrentToken()}`,
      'Accept': 'application/json',
    },
  });

  if (!webFormResponse.ok) {
    const error = await webFormResponse.json();
    throw new Error(error.message || 'Failed to fetch Web Form');
  }

  const webFormData = await webFormResponse.json();
  const docType = webFormData.data.doc_type;

  if (!docType) {
    throw new Error('Web Form has no DocType specified');
  }

  // 2. Submit the data to the DocType endpoint
  const response = await fetch(`${getErpNextApiUrl()}/api/resource/${docType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${await getCurrentToken()}`
    },
    body: JSON.stringify({ data }) // Wrap the data in a data object
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit form');
  }

  return await response.json();
};

export const getFormSubmissions = async (formId) => {
  try {
    // First get the Web Form to know its DocType
    const formResponse = await fetch(`${getErpNextApiUrl()}/api/resource/Web Form/${formId}`, {
      headers: {
        'Authorization': `Bearer ${await getCurrentToken()}`,
      },
    });

    if (!formResponse.ok) {
      throw new Error('Failed to fetch Web Form data');
    }

    const formData = await formResponse.json();
    const docType = formData.data.doc_type;

    if (!docType) {
      throw new Error('Web Form has no DocType specified');
    }

    console.log('Fetching submissions from DocType:', docType);

    // Then fetch submissions from the DocType
    const submissionsResponse = await fetch(
      `${getErpNextApiUrl()}/api/resource/${docType}?limit_page_length=100&order_by=creation desc&fields=["*"]`,
      {
        headers: {
          'Authorization': `Bearer ${await getCurrentToken()}`,
        },
      }
    );

    if (!submissionsResponse.ok) {
      throw new Error(`Failed to fetch submissions from ${docType}`);
    }

    const submissions = await submissionsResponse.json();
    
    // Map the submissions to our expected format
    const formattedSubmissions = submissions.data.map((submission) => ({
      id: submission.name,
      form_id: submission.web_form,
      data: submission,
      submitted_by: submission.owner,
      submitted_by_name: submission.owner_name || submission.owner,
      created_at: submission.creation
    }));

    return {
      data: formattedSubmissions
    };
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    throw error;
  }
};

export const updateFormSubmission = async (webFormName, recordName, data) => {
  console.log('Updating record:', {
    webForm: webFormName,
    recordName: recordName,
    data: data
  });

  // 1. Fetch the Web Form to get the DocType
  const webFormResponse = await fetch(`${getErpNextApiUrl()}/api/resource/Web Form/${webFormName}`, {
    headers: {
      'Authorization': `Bearer ${await getCurrentToken()}`,
      'Accept': 'application/json',
    },
  });

  if (!webFormResponse.ok) {
    const error = await webFormResponse.json();
    throw new Error(error.message || 'Failed to fetch Web Form');
  }

  const webFormData = await webFormResponse.json();
  const docType = webFormData.data.doc_type;

  if (!docType) {
    throw new Error('Web Form has no DocType specified');
  }

  // 2. Update the record in the DocType
  const response = await fetch(`${getErpNextApiUrl()}/api/resource/${docType}/${recordName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${await getCurrentToken()}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update submission');
  }

  return await response.json();
};

export const checkDocTypePermission = async (docType) => {
  try {
    const token = await getCurrentToken();
    const response = await erp.get('/api/method/frappe.client.has_permission', {
      params: {
        doctype: docType,
        ptype: 'read'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.message;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};