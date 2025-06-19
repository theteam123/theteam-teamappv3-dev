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

/**
 * Enhanced error handler for fetch responses
 * Extracts detailed error information from response body
 * @param {Response} response - The fetch response object
 * @param {string} context - Context for the error (e.g., "DocType data", "form submission")
 * @param {string} identifier - Additional identifier (e.g., doctype name, form name)
 * @returns {Promise<Error>} - Promise that rejects with detailed error
 */
export const handleApiError = async (response, context = "API request", identifier = "") => {
  // Enhanced error logging with detailed information
  console.error(`Failed to ${context}:`, {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    identifier: identifier
  });

  // Try to extract error message from response body
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  
  try {
    const errorData = await response.json();
    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    } else if (errorData._server_messages) {
      // Handle server messages (common in ERPNext)
      try {
        const serverMessages = JSON.parse(errorData._server_messages);
        if (Array.isArray(serverMessages)) {
          errorMessage = serverMessages.map(msg => {
            try {
              const parsedMsg = JSON.parse(msg).message;
              return parsedMsg.replace(/<[^>]*>/g, ''); // Remove HTML tags
            } catch {
              return msg.replace(/<[^>]*>/g, ''); // Remove HTML tags
            }
          }).join('. ');
        }
      } catch {
        errorMessage = errorData._server_messages.replace(/<[^>]*>/g, '');
      }
    }
  } catch (parseError) {
    // If we can't parse JSON, try to get text
    try {
      const textError = await response.text();
      if (textError) {
        errorMessage = `${errorMessage} - ${textError}`;
      }
    } catch (textError) {
      // If all else fails, use the basic error message
      console.warn('Could not extract detailed error message:', textError);
    }
  }

  const fullContext = identifier ? `${context} for "${identifier}"` : context;
  return new Error(`Failed to ${fullContext}: ${errorMessage}`);
};

/**
 * Wrapper for fetch with enhanced error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {string} context - Context for error messages
 * @param {string} identifier - Additional identifier for error messages
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchWithErrorHandling = async (url, options = {}, context = "fetch data", identifier = "") => {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw await handleApiError(response, context, identifier);
  }
  
  return response;
}; 