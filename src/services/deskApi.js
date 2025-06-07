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
  
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
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