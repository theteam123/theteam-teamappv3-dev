import { getApiUrl } from '../config/domains';

/**
 * Get the appropriate ERPNext API URL based on the current domain
 * @returns {string} The ERPNext API URL
 */
export const getErpNextApiUrl = () => {
  return getApiUrl();
};

/**
 * Get API key authentication header using environment variables
 * @returns {string} The API key authentication header
 */
export const getApiKeyAuthHeader = () => {
  const apiKey = import.meta.env.VITE_ADMIN_API_KEY;
  const apiSecret = import.meta.env.VITE_ADMIN_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('API key and secret are required but not configured in environment variables');
  }
  
  return `token ${apiKey}:${apiSecret}`;
}; 