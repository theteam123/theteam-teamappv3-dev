/**
 * Get the appropriate ERPNext API URL based on the current domain
 * @returns {string} The ERPNext API URL
 */
export const getErpNextApiUrl = () => {
  const currentDomain = window.location.hostname;
  return currentDomain.includes('teamsite-taktec') 
    ? import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL 
    : import.meta.env.VITE_ERPNEXT_API_URL;
}; 