import { erp } from './erpnext';
import { useAuthStore } from '../stores/auth';

/**
 * Get document details using frappe.desk.form.load.getdoc method
 * @param {Object} params - Object containing all parameters to be passed to the API
 * @returns {Promise<Object>} Object containing the document details
 */
export const getDoc = async (params = {}) => {
  try {
    const response = await erp.get('/api/method/frappe.desk.form.load.getdoc', {
      params
    });

    console.log('Get Doc response:', {
      params,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}; 


/**
 * Get list of module def of logged in user details 
 */
export const getModules = async (params = {}) => {
    try {
      const authStore = useAuthStore();
      const userEmail = authStore.user?.profile?.email || authStore.user?.name;

      // First get the modules list
      const response = await erp.get('/api/method/frappe.desk.search.search_link', {
        params: {
            doctype: 'Module Def',
            ignore_user_permissions: 0,
            reference_doctype: 'DocType',
            txt: '',
            page_length: 1000,
        }
      });

      // Get user document to check blocked modules
      if (userEmail) {
        const userDoc = await getDoc({
          doctype: 'User',
          name: userEmail
        });
        
        // Check if userDoc and docs array exists before accessing
        if (userDoc?.docs && userDoc.docs.length > 0) {
          // Get the block_modules array from user document and create a set of blocked module names
          const blockedModules = userDoc.docs[0].block_modules || [];
          const blockedModuleNames = new Set(blockedModules.map(bm => bm.module));
          
          // Filter out blocked modules from the response
          const filteredModules = response.data.message.filter(module => 
            !blockedModuleNames.has(module.value)
          );

          // Return filtered response
          return {
            ...response.data,
            message: filteredModules
          };
        }
      }
  
      // If no user document or no blocked modules, return original response
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      // Return empty array as message to prevent further errors
      return {
        message: []
      };
    }
}; 

/**
 * Get list of doctypes for a specific module
 * @param {string} module - The module name to fetch doctypes for
 * @returns {Promise<Object>} Object containing the doctypes list
 */
export const getDoctypeModule = async (module) => {
  try {
    const fields = [
      "`tabDocType`.`name`",
      "`tabDocType`.`owner`",
      "`tabDocType`.`creation`",
      "`tabDocType`.`modified`",
      "`tabDocType`.`modified_by`",
      "`tabDocType`.`_user_tags`",
      "`tabDocType`.`_comments`",
      "`tabDocType`.`_assign`",
      "`tabDocType`.`_liked_by`",
      "`tabDocType`.`docstatus`",
      "`tabDocType`.`idx`",
      "`tabDocType`.`module`",
      "`tabDocType`.`color`"
    ];

    const filters = [["DocType", "module", "=", module]];

    const data = {
      doctype: 'DocType',
      fields: JSON.stringify(fields),
      filters: JSON.stringify(filters),
      order_by: '`tabDocType`.`creation` desc',
      start: 0,
      page_length: 100,
      view: 'List',
      with_comment_count: 1
    };

    const response = await erp.post('/api/method/frappe.desk.reportview.get', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctypes for module:', error);
    throw error;
  }
}; 

/**
 * Get list filters for a specific doctype
 * @param {Object} params - Parameters for the report view
 * @param {string} params.reference_doctype - The doctype to get filters for
 * @param {string} params.for_user - The user email to filter by
 * @returns {Promise<Object>} Object containing the list filters
 */
export const getReportView = async (params = {}) => {
  try {
    const defaultParams = {
      fields: ["name", "filter_name", "for_user", "filters"],
      filters: {
        reference_doctype: params.reference_doctype || ""
      },
      or_filters: [
        ["for_user", "=", params.for_user || ""],
        ["for_user", "=", ""]
      ],
      order_by: "filter_name asc",
      doctype: "List Filter",
      limit: 20
    };

    const response = await erp.get('/api/method/frappe.desk.reportview.get_list', {
      params: {
        fields: JSON.stringify(defaultParams.fields),
        filters: JSON.stringify(defaultParams.filters),
        or_filters: JSON.stringify(defaultParams.or_filters),
        order_by: defaultParams.order_by,
        doctype: defaultParams.doctype,
        limit: defaultParams.limit
      }
    });

    console.log('Report View response:', {
      params: defaultParams,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching report view:', error);
    throw error;
  }
};

/**
 * Delete an item using frappe.client.delete method
 * @param {string} doctype - The doctype of the item to delete
 * @param {string} name - The name/id of the item to delete
 * @returns {Promise<Object>} Response from the delete operation
 */
export const deleteItem = async (doctype, name) => {
  try {
    const formData = new FormData();
    formData.append('doctype', doctype);
    formData.append('name', name);

    const response = await erp.post('/api/method/frappe.client.delete', formData);

    console.log('Delete item response:', {
      doctype,
      name,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

/**
 * Insert a new item using frappe.client.insert method
 * @param {Object} doc - The document object containing all the fields to insert
 * @returns {Promise<Object>} Response from the insert operation
 */
export const insertItem = async (doc) => {
  try {
    const formData = new FormData();
    formData.append('doc', JSON.stringify(doc));

    const response = await erp.post('/api/method/frappe.client.insert', formData);

    console.log('Insert item response:', {
      doc,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error inserting item:', error);
    throw error;
  }
};

/**
 * Search for links using frappe.desk.search.search_link method
 * @param {Object} params - Object containing search parameters
 * @param {string} params.txt - Search text
 * @param {string} params.doctype - The doctype to search in
 * @param {number} params.ignore_user_permissions - Whether to ignore user permissions (0 or 1)
 * @param {string} params.reference_doctype - Reference doctype for the search
 * @param {number} params.page_length - Number of results to return
 * @returns {Promise<Object>} Object containing the search results
 */
export const searchLink = async (params = {}) => {
  try {
    const formData = new FormData();
    formData.append('txt', params.txt || '');
    formData.append('doctype', params.doctype || '');
    formData.append('ignore_user_permissions', params.ignore_user_permissions || 0);
    formData.append('reference_doctype', params.reference_doctype || '');
    formData.append('page_length', params.page_length || 10);

    const response = await erp.post('/api/method/frappe.desk.search.search_link', formData);

    console.log('Search Link response:', {
      params,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error('Error searching links:', error);
    throw error;
  }
};


