import axios from 'axios';

// Get the current domain and environment
const currentDomain = window.location.hostname;
const isProduction = import.meta.env.PROD;

// Determine which ERPNext instance to use based on domain and environment
const getErpNextConfig = () => {
  // Production environment
  if (isProduction) {
    if (currentDomain.includes('teamsite-taktec')) {
      return {
        baseURL: import.meta.env.VITE_TAKTEC_ERPNEXT_API_URL,
        apiKey: import.meta.env.VITE_TAKTEC_ERPNEXT_API_KEY,
        apiSecret: import.meta.env.VITE_TAKTEC_ERPNEXT_API_SECRET
      };
    }
    return {
      baseURL: import.meta.env.VITE_ERPNEXT_API_URL,
      apiKey: import.meta.env.VITE_ERPNEXT_API_KEY,
      apiSecret: import.meta.env.VITE_ERPNEXT_API_SECRET
    };
  }
  
  // Development environment
  if (currentDomain.includes('teamsite-taktec')) {
    return {
      baseURL: import.meta.env.VITE_TAKTEC_ERPNEXT_API_URL || 'http://taktec.theteam.net.au',
      apiKey: import.meta.env.VITE_TAKTEC_ERPNEXT_API_KEY,
      apiSecret: import.meta.env.VITE_TAKTEC_ERPNEXT_API_SECRET
    };
  }
  return {
    baseURL: import.meta.env.VITE_ERPNEXT_API_URL || 'https://erp.theteam.net.au',
    apiKey: import.meta.env.VITE_ERPNEXT_API_KEY,
    apiSecret: import.meta.env.VITE_ERPNEXT_API_SECRET
  };
};

const config = getErpNextConfig();

// Log configuration in development
if (!isProduction) {
  console.log('Current Environment:', isProduction ? 'Production' : 'Development');
  console.log('Current Domain:', currentDomain);
  console.log('Using API URL:', config.baseURL);
}

const erp = axios.create({
  baseURL: config.baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add request interceptor to ensure auth headers are present
erp.interceptors.request.use(
  (config) => {
    // Get the session ID from cookie
    const sid = document.cookie.split(';').find(c => c.trim().startsWith('sid='));
    if (sid) {
      config.headers['X-Frappe-Session-Id'] = sid.split('=')[1].trim();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
erp.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 || error.response?.data?.exc_type === 'PermissionError') {
      // Session might be expired, redirect to login
      window.location.href = '/auth';
      return Promise.reject(new Error('Session expired'));
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

export const getFormData = async (doctype, name) => {
  try {
    const response = await erp.get(`/api/resource/${doctype}/${name}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching form data:', error.response?.data || error);
    throw error;
  }
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
    // Create a new axios instance for this request with the API key
    const apiClient = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `token ${config.apiKey}:${config.apiSecret}`
      }
    });

    // Calculate start and end for pagination
    const limit_start = (page - 1) * pageSize;
    const limit_page_length = pageSize;

    // Build filters array
    const filters = [['DocType', 'istable', '=', 0]];
    
    // Add search filter if search term exists
    if (search) {
      filters.push(['DocType', 'name', 'like', `%${search}%`]);
    }
    
    // Add category filter if category is selected
    if (category) {
      filters.push(['DocType', 'module', '=', category]);
    }

    // First get the total count using a count query
    const countResponse = await apiClient.get('/api/method/frappe.client.get_count', {
      params: {
        doctype: 'DocType',
        filters: JSON.stringify(filters)
      }
    });

    const total = countResponse.data.message || 0;

    // Then fetch the actual data
    const response = await apiClient.get('/api/resource/DocType', {
      params: {
        fields: '["name", "module", "modified", "creation", "description", "fields"]',
        filters: JSON.stringify(filters),
        limit_start,
        limit_page_length,
        as_list: 1
      }
    });

    return {
      data: response.data.data || response.data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error) {
    console.error('Error fetching document types:', error.response?.data || error);
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