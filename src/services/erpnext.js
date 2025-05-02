import axios from 'axios';

// Determine the base URL based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? 'https://erp.theteam.net.au'  // Local development
  : 'https://erp.theteam.net.au'; // Production

const erp = axios.create({
  baseURL,
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
      // window.location.href = '/auth';
      // return Promise.reject(new Error('Session expired'));
      console.log('Session expired');
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
      device: 'mobile',
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

export const getDocTypes = async () => {
  try {
    // Get the stored user ID
    const userId = localStorage.getItem('frappe_user');
    if (!userId) {
      throw new Error('Not authenticated');
    }

    // Verify we're logged in by checking the user resource
    const userResponse = await erp.get(`/api/resource/User/${userId}`);
    if (!userResponse.data.data) {
      throw new Error('Not authenticated');
    }

    // Then fetch the doctypes
    const response = await erp.get('/api/resource/DocType', {
      params: {
        fields: '["name", "module", "modified", "creation", "description", "fields"]',
        filters: JSON.stringify([['DocType', 'istable', '=', 0]])
      }
    });
    return response.data.data;
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