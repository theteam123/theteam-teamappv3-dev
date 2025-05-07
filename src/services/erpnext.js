import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { getCurrentToken } from './oauth';

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
export const erp = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to add OAuth token
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

    return {
      data: docTypesWithCounts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error) {
    console.error('Error fetching document types:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

export const createDocType = async (data) => {
  try {
    const response = await erp.post('/api/resource/DocType', {
      data: data
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
    return response.data;
  } catch (error) {
    console.error('Error updating document type:', error.response?.data || error);
    throw error;
  }
};

export const deleteDocType = async (name) => {
  try {
    const response = await erp.delete(`/api/resource/DocType/${name}`);
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

    // Then fetch the data
    const response = await erp.get('/api/method/frappe.client.get_list', {
      params: {
        doctype: 'Web Form',
        fields: '["name", "title", "module", "modified", "creation", "route", "is_standard", "doc_type", "success_url", "success_message", "login_required", "allow_edit", "allow_multiple"]',
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

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
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

export const createForm = async (doctype, data) => {
  try {
    const response = await erp.post(`/api/resource/${doctype}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating form:', error);
    throw error;
  }
};