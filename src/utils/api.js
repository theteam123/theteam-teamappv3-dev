import { getApiUrl } from '../config/domains';

/**
 * Get the appropriate ERPNext API URL based on the current domain
 * @returns {string} The ERPNext API URL
 */
export const getErpNextApiUrl = () => {
  return getApiUrl();
}; 