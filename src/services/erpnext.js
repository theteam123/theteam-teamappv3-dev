import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { getCurrentToken } from './oauth';
import { getErpNextApiUrl, getApiKeyAuthHeader, getTheTeamAuthHeader } from '../utils/api';
import { handleApiError, fetchWithErrorHandling } from '../utils/api';
import { getDomainConfig } from '../config/domains';
import { getDoctypeModule } from './deskApi';
import { parseServerError, handleServerError } from '../utils/errorCapture';

// Get the current domain and environment
const isProduction = import.meta.env.PROD;

// Determine which ERPNext instance to use based on domain and environment
export const getErpNextConfig = () => {
  const config = getDomainConfig();
  
  // Production environment
  if (isProduction) {
    return {
      baseURL: config.apiUrl
    };
  }
  
  // Development environment
  return {
    baseURL: config.apiUrl || config.fallbackUrl
  };
};

const config = getErpNextConfig();

// Log configuration in development
if (!isProduction) {
  console.log('Current Environment:', isProduction ? 'Production' : 'Development');
  console.log('Current Domain:', window.location.hostname);
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
export const erp = createAxiosInstance();

// List of endpoints that should use API key authentication
const apiKeyEndpoints = [
  '/api/method/frappe.core.page.permission_manager.permission_manager.get_permissions',
  '/api/method/frappe.client.get_list',
  '/api/method/frappe.desk.reportview.get',
  '/api/resource/',
  '/api/method/frappe.desk.form.load.getdoc'
];

erp.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  // console.log('Request interceptor - Is System Manager:', authStore.isSystemManager);
  // console.log('Request interceptor - Config:', config.url);

  // Check if the current endpoint should use API key auth
  const shouldUseApiKey = apiKeyEndpoints.some(endpoint => config.url?.includes(endpoint));

  if (shouldUseApiKey && !authStore.isSystemManager) {
    // Use API key authentication for specified endpoints
    try {
      // console.log('Request interceptor - Using API key authentication');
      config.headers.Authorization = getApiKeyAuthHeader();
    } catch (error) {
      console.error('Failed to get API key authentication:', error);
      throw error;
    }
  } else {
    // Use OAuth token for all other endpoints
    try {
      const token = await getCurrentToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get OAuth token:', error);
      throw error;
    }
  }
  return config;
});

// Add response interceptor for error handling
erp.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Error response:', error.response);
      if (error.response?.data?._error_message) {
        throw new Error(error.response?.data?._error_message);
      }
      // Only redirect if not already on auth page
      if (!window.location.pathname.includes('/auth')) {
        // localStorage.removeItem('oauth_token');
        // localStorage.removeItem('oauth_token_expiry');
        // localStorage.removeItem('oauth_refresh_token');      
        // window.location.href = '/auth';
        throw new Error('Authentication failed');
      }
    }
    return Promise.reject(error);
  }
);

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
    
    // First, get the web form details
    const webFormResponse = await erp.get(`/api/resource/${doctype}/${name}`);
    const webFormData = webFormResponse.data.data;
    let doctype_param = doctype;
    if (doctype === 'Web Form') {
      doctype_param = webFormData.doc_type;
    }
    
    
    // Get the doctype metadata using the getdoctype endpoint
    // const response = await erp.get(`/api/method/frappe.desk.form.load.getdoctype`, {
    //   params: {
    //     doctype: doctype_param
    //   }
    // });
    // console.log('Response from getdoctype:', response.data);
    // setCachedMetadata(cacheKey, response.data);

    // Get the doctype metadata using the getdoctype endpoint
    // const response = await erp.get(`/api/method/frappe.desk.form.load.getdoctype`, {
    //   params: {
    //     doctype: doctype_param
    //   }
    // });
    // console.log('Response from getdoctype:', response.data);
    // setCachedMetadata(cacheKey, response.data);
    return {
      data: {
        ...webFormData,
      }
    };
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

export const getFormList = async (doctype, options = {}) => {
  try {
    const {
      limit = 20,
      offset = 0,
      order_by = 'modified desc',
      fields = ['name', 'owner', 'creation', 'modified']  // Default fields
    } = options;

    const authStore = useAuthStore();
    const permissions = await getDoctypePermissions(doctype, authStore.user?.roles?.[0]);
    const ifOwner = permissions[0]?.if_owner === 1;

    // Build filters array
    let filters = [];
    
    // Add owner filter if if_owner permission is true
    if (ifOwner) {
      filters.push(['owner', '=', authStore.user?.email]);
    }

    // Add any additional filters from options
    if (options.filters) {
      filters = [...filters, ...options.filters];
    }

    const params = new URLSearchParams({
      limit_page_length: limit.toString(),
      limit_start: offset.toString(),
      order_by,
      fields: JSON.stringify(fields),
      filters: JSON.stringify(filters)
    });

    const response = await erp.get(`/api/resource/${doctype}?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error listing forms:', error.response?.data || error);
    throw error;
  }
};

export const getDocTypes = async (page = 1, pageSize = 20, search = '', category = '', order_by = 'modified', order = 'desc') => {
  try {
    const authStore = useAuthStore();
    const username = authStore.user?.name;
    console.log('Current user from auth store:', username);
    console.log('Current user from auth store:', authStore.user);

    let doctypeModuleResponse;
    console.log('Category:', category);
    if (category) {
      doctypeModuleResponse = await getDoctypeModule(category);
    }
    console.log('DocType Module Response:', doctypeModuleResponse);

    // Define system roles to exclude
    const systemRoles = ['Administrator', 'Desk User', 'Guest', 'All'];

    // Check if user has System Manager role
    const isSystemManager = authStore.user?.roles?.includes('System Manager');
    console.log('Is System Manager:', isSystemManager);

    let permissions;
    if (isSystemManager) {
      // If System Manager, only get permissions for that role
      const response = await erp.post('/api/method/frappe.core.page.permission_manager.permission_manager.get_permissions', {
        doctype: '',
        role: 'System Manager'
      });
      permissions = response.data.message || [];
    } else {
      // For non-System Managers, check all non-system roles
      const userRoles = authStore.user.roles.filter(role => !systemRoles.includes(role));
      console.log('Filtered user roles:', userRoles);

      // Get permissions for each role
      const rolePermissionsPromises = userRoles.map(role => 
        erp.post('/api/method/frappe.core.page.permission_manager.permission_manager.get_permissions', {
          doctype: '',
          role: role
        })
      );

      const rolePermissionsResponses = await Promise.all(rolePermissionsPromises);
      
      // Combine permissions from all roles
      permissions = rolePermissionsResponses.flatMap(response => response.data.message || []);
    }

    console.log('Permissions:', permissions);

    // Filter permissions to get only readable doctypes
    const readableDoctypes = permissions
      .filter(perm => isSystemManager || perm.read === 1)
      .map(perm => ({
        name: perm.parent,
        doctype: perm.parent,
        permissions: {
          read: isSystemManager ? 1 : perm.read,
          write: isSystemManager ? 1 : perm.write,
          create: isSystemManager ? 1 : perm.create,
          delete: isSystemManager ? 1 : perm.delete,
          submit: isSystemManager ? 1 : perm.submit,
          cancel: isSystemManager ? 1 : perm.cancel,
          amend: isSystemManager ? 1 : perm.amend,
          report: isSystemManager ? 1 : perm.report,
          export: isSystemManager ? 1 : perm.export,
          import: isSystemManager ? 1 : perm.import,
          share: isSystemManager ? 1 : perm.share,
          print: isSystemManager ? 1 : perm.print,
          email: isSystemManager ? 1 : perm.email
        },
        linked_doctypes: perm.linked_doctypes || [],
        modified: perm.modified,
        creation: perm.creation
      }));

    // Apply search filter if provided
    let filteredDoctypes = readableDoctypes;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDoctypes = filteredDoctypes.filter(dt => 
        dt.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter if provided
    if (category) {
      // Get the list of allowed document names from doctypeModuleResponse
      const allowedDoctypes = doctypeModuleResponse?.message.values?.map(row => row[0]) || [];
      
      // Filter doctypes based on whether their name is in the allowed list
      filteredDoctypes = filteredDoctypes.filter(dt => allowedDoctypes.includes(dt.name));
    }

    // Sort the results
    filteredDoctypes.sort((a, b) => {
      if (order === 'desc') {
        return new Date(b[order_by]) - new Date(a[order_by]);
      }
      return new Date(a[order_by]) - new Date(b[order_by]);
    });

    // Calculate pagination
    const total = filteredDoctypes.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedDoctypes = filteredDoctypes.slice(start, end);

    // Get additional details for each doctype
    const doctypesWithDetails = await Promise.all(
      paginatedDoctypes.map(async (dt) => {
        try {
          return {
            id: dt.name,
            name: dt.name,
            permissions: dt.permissions,
            linked_doctypes: dt.linked_doctypes,
            modified: dt.modified,
            creation: dt.creation,
          };
        } catch (error) {
          console.error(`Error fetching details for doctype ${dt.name}:`, error);
          return {
            id: dt.name,
            name: dt.name,
            permissions: dt.permissions,
            linked_doctypes: dt.linked_doctypes,
            modified: dt.modified,
            creation: dt.creation,
          };
        }
      })
    );

    return {
      data: doctypesWithDetails,
      total,
      page,
      pageSize,
      totalPages
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

// Add a function to clear DocType cache
export const clearDocTypeCache = (page, pageSize, search, category) => {
  const cacheKey = `doctypes-${page}-${pageSize}-${search}-${category}`;
  invalidateMetadataCache(cacheKey);
  console.log('Cleared DocType cache for:', cacheKey);
};

// Update the existing functions to clear cache when modifying DocTypes
export const createDocType = async (data) => {
  try {
    const response = await erp.post('/api/resource/DocType', data);
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

    console.log('Forms data:', data);

    // Post-process the forms to check permissions
    const processedForms = await Promise.all(
      data.map(async (form) => {
        let hasPermission = true;
        // if (form.apply_document_permissions) {
          hasPermission = await checkDocTypePermission(form.doc_type);
        // }
        return {
          ...form,
          has_permission: hasPermission
        };
      })
    );

    console.log('Processed forms:', processedForms);

    // Filter out forms without permission BEFORE calculating pagination
    const accessibleForms = processedForms.filter(form => form.has_permission.has_permission === true);

    console.log('Accessible forms:', accessibleForms);

    // Calculate pagination based on accessible forms
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedForms = accessibleForms.slice(startIndex, endIndex);

    return {
      data: paginatedForms,
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

export const createDoctypeSubmission = async (doctypeName, data, submissionType = 'private') => {
  try {
    let authHeader = `Bearer ${await getCurrentToken()}`;
    if (submissionType === 'public') {
      authHeader = getApiKeyAuthHeader();
    }
    const response = await fetchWithErrorHandling(
      `${getErpNextApiUrl()}/api/resource/${doctypeName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({ data })
      },
      'submit doctype form',
      doctypeName
    );

    return await response.json();
  } catch (error) {
    console.error('Error submitting doctype form:', error);
    throw error;
  }
};

export const createForm = async (webFormName, data) => {
  // 1. Fetch the Web Form to get the DocType
  const webFormResponse = await fetchWithErrorHandling(
    `${getErpNextApiUrl()}/api/resource/Web Form/${webFormName}`,
    {
      headers: {
        'Authorization': `Bearer ${await getCurrentToken()}`,
        'Accept': 'application/json',
      },
    },
    'fetch Web Form',
    webFormName
  );

  const webFormData = await webFormResponse.json();
  const docType = webFormData.data.doc_type;

  if (!docType) {
    throw new Error('Web Form has no DocType specified');
  }

  // 2. Submit the data to the DocType endpoint
  const response = await fetchWithErrorHandling(
    `${getErpNextApiUrl()}/api/resource/${docType}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${await getCurrentToken()}`
      },
      body: JSON.stringify({ data }) // Wrap the data in a data object
    },
    'submit form',
    docType
  );

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

export const updateDoctypeSubmission = async (doctypeName, recordName, data) => {
  try {
    const response = await fetch(`${getErpNextApiUrl()}/api/resource/${doctypeName}/${recordName}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${await getCurrentToken()}`
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update submission');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating doctype submission:', error);
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
        docname: '', // Empty string for DocType level permission check
        ptype: 'read'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Permission response:', response.data.message);
    return response.data.message;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export const getDocTypeData = async (doctypeName, submissionType = 'private') => {
  try {
    let authHeader = `Bearer ${await getCurrentToken()}`;
    if (submissionType === 'public') {
      authHeader = getApiKeyAuthHeader();
    }
    const response = await fetchWithErrorHandling(
      `${getErpNextApiUrl()}/api/method/frappe.desk.form.load.getdoctype?doctype=${doctypeName}`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      },
      'fetch DocType data',
      doctypeName
    );
    
    return await response.json();
  } catch (err) {
    console.error('Error fetching DocType:', err);
    throw err;
  }
};

export const getSupportDocTypeData = async (doctypeName) => {
  try {
    // Support Request is a custom doctype that is not available in the ERPNext instance
    // so we need to use the TheTeam API to get the data
    let fullUrl = `https://desk.theteamapp.theteam.net.au/api/method/frappe.desk.form.load.getdoctype?doctype=${doctypeName}`;

    const response = await fetchWithErrorHandling(
      fullUrl,
      {
        headers: {
          'Authorization': getTheTeamAuthHeader(),
          'Accept': 'application/json'
        }
      },
      'fetch Support DocType data',
      doctypeName
    );
    
    return await response.json();
  } catch (err) {
    console.error('Error fetching Support DocType:', err);
    throw err;
  }
};

export const createSupportForm = async (data) => {
  try {
    // Support Request is a custom doctype that is not available in the ERPNext instance
    // so we need to use the TheTeam API to create it
    
    // Clean and validate the data before sending
    const cleanedData = { ...data };
    
    // Handle additional_data field specifically
    if (cleanedData.additional_data) {
      try {
        // If it's already a string, try to parse and re-stringify to ensure valid JSON
        if (typeof cleanedData.additional_data === 'string') {
          const parsed = JSON.parse(cleanedData.additional_data);
          cleanedData.additional_data = JSON.stringify(parsed);
          console.log('Parsed and re-stringify additional_data:', cleanedData.additional_data);
        } else {
          // If it's an object, stringify it
          cleanedData.additional_data = JSON.stringify(cleanedData.additional_data);
          console.log('Stringified additional_data object:', cleanedData.additional_data);
        }
      } catch (jsonError) {
        console.warn('Invalid JSON in additional_data, setting to empty object:', jsonError);
        cleanedData.additional_data = '{}';
      }
    }
    
    // Ensure all string fields are properly trimmed and not null
    Object.keys(cleanedData).forEach(key => {
      if (typeof cleanedData[key] === 'string') {
        cleanedData[key] = cleanedData[key].trim();
        if (cleanedData[key] === '') {
          cleanedData[key] = null;
        }
      }
    });

    // First attempt: Try with the full data
    try {
      const response = await fetch(`https://desk.theteamapp.theteam.net.au/api/resource/Support Request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': getTheTeamAuthHeader()
        },
        body: JSON.stringify({ data: cleanedData })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Support form submission error:', error);
        
        // If it's an additional_data constraint error, try without it
        if (error.exc && error.exc.includes('additional_data')) {
          const dataWithoutAdditional = { ...cleanedData };
          delete dataWithoutAdditional.additional_data;
          
          const retryResponse = await fetch(`https://desk.theteamapp.theteam.net.au/api/resource/Support Request`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': getTheTeamAuthHeader()
            },
            body: JSON.stringify({ data: dataWithoutAdditional })
          });
          
          if (!retryResponse.ok) {
            const retryError = await retryResponse.json();
            throw new Error(retryError.message || 'Failed to submit support request');
          }
          
          const result = await retryResponse.json();
          return result;
        }
        
        throw new Error(error.message || 'Failed to submit support request');
      }

      const result = await response.json();
      return result;
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in createSupportForm:', error);
    throw error;
  }
};

export const getChildTableData = async (doctype, name) => {
  try {
    const response = await fetch(`${getErpNextApiUrl()}/api/resource/${encodeURIComponent(doctype)}/${name}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getCurrentToken()}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch child table data');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server did not return JSON');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getChildTableData:', error);
    throw error;
  }
};

export const uploadFile = async (file, doctype, docname, isPrivate = false) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', doctype);
    formData.append('docname', docname);
    formData.append('is_private', isPrivate ? '1' : '0');
    formData.append('optimize', '1');

    let response;

    if (docname == 'support-request') {
      response = await fetch(`https://desk.theteamapp.theteam.net.au/api/method/upload_file`, {
        method: 'POST',
        headers: {
          'Authorization': getTheTeamAuthHeader()
        },
        body: formData
      });
    } else {
      response = await fetch(`${getErpNextApiUrl()}/api/method/upload_file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getCurrentToken()}`
        },
        body: formData
      });
    }



    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    const errorMessage = handleServerError(error, 'uploadFile', 'Failed to upload file');
    throw errorMessage;
  }
};

/**
 * Get all permissions for a specific role from Role Permission Manager
 * @param {string} roleName - The name of the role to check permissions for
 * @returns {Promise<Object>} Object containing all permissions for the role
 */
export const getRolePermissions = async (roleName) => {
  try {
    const response = await erp.post('/api/method/frappe.core.page.permission_manager.permission_manager.get_permissions', {
      doctype: '',
      role: roleName
    });


    return response.data.message || {};
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

/**
 * Get all permissions for a specific role from Role Permission Manager
 * @param {string} roleName - The name of the role to check permissions for
 * @returns {Promise<Object>} Object containing all permissions for the role
 */
export const getDoctypePermissions = async (doctype, roleName) => {
  try {
    const response = await erp.post('/api/method/frappe.core.page.permission_manager.permission_manager.get_permissions', {
      doctype: doctype,
      role: roleName
    });

    console.log('Role and Doctype permissions response:', {
      role: roleName,
      doctype: doctype,
      permissions: response.data
    });

    return response.data.message || {};
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

/**
 * Get names for mentions from Frappe desk search
 * @param {Object} data - The search parameters
 * @returns {Promise<Object>} Response containing names for mentions
 */
export const getNamesForMentions = async (data = {}) => {
  try {
    const response = await erp.post('/api/method/frappe.desk.search.get_names_for_mentions', data);
    return response.data;
  } catch (error) {w
    const errorMessage = handleServerError(error, 'getNamesForMentions', 'Failed to fetch names for mentions');
    throw new Error(errorMessage);
  }
};

/**
 * Add a comment to a document
 * @param {Object} commentData - The comment data
 * @param {string} commentData.reference_doctype - The DocType of the document
 * @param {string} commentData.reference_name - The name of the document
 * @param {string} commentData.content - The HTML content of the comment
 * @param {string} commentData.comment_email - Email of the person commenting
 * @param {string} commentData.comment_by - Name of the person commenting
 * @returns {Promise<Object>} Response from the add comment API
 */
export const addComment = async (commentData) => {
  try {
    const response = await erp.post('/api/method/frappe.desk.form.utils.add_comment', commentData);
    return response.data;
  } catch (error) {
    const errorMessage = handleServerError(error, 'addComment', 'Failed to add comment');
    throw new Error(errorMessage);
  }
};
