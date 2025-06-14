import { getApiUrl, getDomainConfig } from '../config/domains';

/**
 * Get the appropriate ERPNext API URL based on the current domain
 * @returns {string} The ERPNext API URL
 */
export const getErpNextApiUrl = () => {
  return getApiUrl();
};

/**
 * Get API key authentication header using domain configuration
 * @returns {string} The API key authentication header
 */
export const getApiKeyAuthHeader = () => {
  const config = getDomainConfig();
  const apiKey = import.meta.env[`VITE_ADMIN_${config.key}_API_KEY`] || import.meta.env.VITE_ADMIN_API_KEY;
  const apiSecret = import.meta.env[`VITE_ADMIN_${config.key}_API_SECRET`] || import.meta.env.VITE_ADMIN_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error(`API key and secret are required but not configured in environment variables for domain: ${config.key}`);
  }
  
  return `token ${apiKey}:${apiSecret}`;
};

/**
 * Get API key authentication header using static admin credentials
 * @returns {string} The API key authentication header
 */
export const getTheTeamAuthHeader = () => {
  const apiKey = import.meta.env.VITE_ADMIN_API_KEY;
  const apiSecret = import.meta.env.VITE_ADMIN_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('API key and secret are required but not configured in environment variables');
  }
  
  return `token ${apiKey}:${apiSecret}`;
}; 