// Domain configuration for different environments
export const DOMAINS = {
  'teamsite-taktec': {
    apiUrl: import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL,
    fallbackUrl: 'http://taktec.theteam.net.au',
    oauthConfig: {
      clientId: import.meta.env.VITE_OAUTH_TAKTEC_CLIENT_ID,
      clientSecret: import.meta.env.VITE_OAUTH_TAKTEC_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_OAUTH_TAKTEC_REDIRECT_URI
    }
  },
  'teamsite-sgcloud': {
    apiUrl: import.meta.env.VITE_ERPNEXT_SGCLOUD_API_URL,
    fallbackUrl: 'https://ops.sgcloud.com.au',
    oauthConfig: {
      clientId: import.meta.env.VITE_OAUTH_SGCLOUD_CLIENT_ID,
      clientSecret: import.meta.env.VITE_OAUTH_SGCLOUD_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_OAUTH_SGCLOUD_REDIRECT_URI
    }
  },
  'default': {
    apiUrl: import.meta.env.VITE_ERPNEXT_API_URL,
    fallbackUrl: 'https://erp.theteam.net.au',
    oauthConfig: {
      clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
      clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI
    }
  }
};

/**
 * Get domain configuration based on the current hostname
 * @returns {Object} Domain configuration object
 */
export const getDomainConfig = () => {
  const currentDomain = window.location.hostname;
  
  // Find the matching domain configuration
  const domainKey = Object.keys(DOMAINS).find(key => 
    key !== 'default' && currentDomain.includes(key)
  ) || 'default';

  return DOMAINS[domainKey];
};

/**
 * Get the appropriate ERPNext API URL based on the current domain and environment
 * @returns {string} The ERPNext API URL
 */
export const getApiUrl = () => {
  const config = getDomainConfig();
  const isProduction = import.meta.env.PROD;
  
  return isProduction ? config.apiUrl : (config.apiUrl || config.fallbackUrl);
};

/**
 * Get OAuth configuration for the current domain
 * @returns {Object} OAuth configuration object
 */
export const getOAuthConfig = () => {
  const config = getDomainConfig();
  return config.oauthConfig;
}; 