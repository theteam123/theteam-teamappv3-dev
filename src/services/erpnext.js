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
        baseURL: import.meta.env.VITE_TAKTEC_ERPNEXT_API_URL
      };
    }
    return {
      baseURL: import.meta.env.VITE_ERPNEXT_API_URL
    };
  }
  
  // Development environment
  if (currentDomain.includes('teamsite-taktec')) {
    return {
      baseURL: import.meta.env.VITE_TAKTEC_ERPNEXT_API_URL || 'http://taktec.theteam.net.au'
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

    console.log('API Response:', {
      status: response.status,
      data: response.data,
      message: response.data.message,
      total_count: total
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

    console.log('Processed data:', {
      dataLength: data.length,
      total,
      firstItem: data[0]
    });

    return {
      data,
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