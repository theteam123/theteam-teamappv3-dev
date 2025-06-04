// Shared navigation items available across all domains
export const SHARED_NAVIGATION = [
  { 
    name: 'Documents',
    path: '/documents',
    icon: 'FileTextIcon',
    description: 'Manage and organize your company documents',
    requiredRoles: ['System Manager', 'Taktec User', 'Technician'] 
  },
  { 
    name: 'Voice Assistant', 
    path: '/voice-assistant', 
    icon: 'MicIcon', 
    description: 'AI Voice Assistant', 
    requiredRoles: ['Dizza'] 
  }

];

// Domain configuration for different environments
export const DOMAINS = {
  'taktec': {
    key: 'TAKTEC',
    apiUrl: import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL,
    fallbackUrl: 'http://desk.taktec.theteam.net.au',
    logo: '/taktec-logo.png',
    theme: {
      primary: '#fcb040', // green-700
      secondary: '#4ade80', // green-400
      accent: '#22c55e' // green-500
    },
    oauthConfig: {
      clientId: import.meta.env.VITE_OAUTH_TAKTEC_CLIENT_ID,
      clientSecret: import.meta.env.VITE_OAUTH_TAKTEC_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_OAUTH_TAKTEC_REDIRECT_URI
    },
    documentItems: []
  },
  'teamsite-sgcloud': {
    key: 'SGCLOUD',
    apiUrl: import.meta.env.VITE_ERPNEXT_SGCLOUD_API_URL,
    fallbackUrl: 'https://ops.sgcloud.com.au',
    logo: '/SGCAustralia-Logo.svg',
    theme: {
      primary: '#3fd921', // green-700
      secondary: '#4ade80', // green-400
      accent: '#22c55e' // green-500
    },
    oauthConfig: {
      clientId: import.meta.env.VITE_OAUTH_SGCLOUD_CLIENT_ID,
      clientSecret: import.meta.env.VITE_OAUTH_SGCLOUD_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_OAUTH_SGCLOUD_REDIRECT_URI
    },
    documentItems: [
      { 
        name: 'Companies', 
        path: '/companies', 
        icon: 'BuildingOfficeIcon', 
        description: 'Companies', 
        requiredRoles: ['SGCloud User', 'System Manager'] 
      },
      { 
        name: 'Contacts', 
        path: '/contacts', 
        icon: 'UserIcon', 
        description: 'Contacts', 
        requiredRoles: ['SGCloud User', 'System Manager'] 
      },
      { 
        name: 'Leads', 
        path: '/leads', 
        icon: 'UserIcon', 
        description: 'Leads', 
        requiredRoles: ['SGCloud User', 'System Manager'] 
      },
      { 
        name: 'Opportunities', 
        path: '/opportunities', 
        icon: 'UserIcon', 
        description: 'Opportunities', 
        requiredRoles: ['SGCloud User', 'System Manager'] 
      },
      { 
        name: 'Activities', 
        path: '/activities', 
        icon: 'UserIcon', 
        description: 'Activities', 
        requiredRoles: ['SGCloud User', 'System Manager'] 
      } 
    ]
  },
  'theteamapp': {
    key: 'THETEAMAPP',
    apiUrl: import.meta.env.VITE_ERPNEXT_API_URL,
    fallbackUrl: 'https://desk.theteamapp.theteam.net.au',
    logo: '/TeamLogo.png',
    theme: {
      primary: '#15803d', // green-700
      secondary: '#4ade80', // green-400
      accent: '#22c55e' // green-500
    },
    oauthConfig: {
      clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
      clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI
    },
    documentItems: []
  },
  'default': {
    key: 'DEFAULT',
    apiUrl: import.meta.env.VITE_ERPNEXT_API_URL,
    fallbackUrl: 'https://desk.theteamapp.theteam.net.au',
    logo: '/TeamLogo.png',
    theme: {
      primary: '#15803d', // green-700
      secondary: '#4ade80', // green-400
      accent: '#22c55e' // green-500
    },
    oauthConfig: {
      clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
      clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI
    },
    documentItems: []
  }
};

/**
 * Get domain configuration based on the current hostname
 * @returns {Object} Domain configuration object
 */
export const getDomainConfig = () => {
  const currentDomain = window.location.hostname;
  
  // For testing purposes, set the current domain to 'teamsite-sgcloud'
  // const currentDomain = 'teamsite-sgcloud';
  // const currentDomain = 'taktec';
  
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

/**
 * Get logo path for the current domain
 * @returns {string} Logo path
 */
export const getLogo = () => {
  const config = getDomainConfig();
  return config.logo;
};

/**
 * Get theme configuration for the current domain
 * @returns {Object} Theme configuration object
 */
export const getTheme = () => {
  const config = getDomainConfig();
  return config.theme;
};

/**
 * Get combined document items for the current domain
 * @returns {Array} Array of document items including shared and domain-specific items
 */
export const getDocumentItems = () => {
  const config = getDomainConfig();
  // Combine shared navigation with domain-specific items
  // Use spread operator to create a new array to avoid modifying the original arrays
  return [...SHARED_NAVIGATION, ...(config.documentItems || [])];
}; 