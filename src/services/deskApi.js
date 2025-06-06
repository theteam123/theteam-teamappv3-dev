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
 * Get list of modules details 
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