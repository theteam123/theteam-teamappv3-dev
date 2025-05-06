import axios from 'axios';

let clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
let clientSecret = import.meta.env.VITE_OAUTH_CLIENT_SECRET;
let redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI;
let authorizationEndpoint = `${import.meta.env.VITE_ERPNEXT_API_URL}/api/method/frappe.integrations.oauth2.authorize`;
let tokenEndpoint = `${import.meta.env.VITE_ERPNEXT_API_URL}/api/method/frappe.integrations.oauth2.get_token`;
const scope = 'all openid';

const currentDomain = window.location.hostname;

if (currentDomain.includes('teamsite-taktec')) {
  clientId = import.meta.env.VITE_OAUTH_TAKTEC_CLIENT_ID;
  clientSecret = import.meta.env.VITE_OAUTH_TAKTEC_CLIENT_SECRET;
  redirectUri = import.meta.env.VITE_OAUTH_TAKTEC_REDIRECT_URI;
  authorizationEndpoint = `${import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL}/api/method/frappe.integrations.oauth2.authorize`;
  tokenEndpoint = `${import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL}/api/method/frappe.integrations.oauth2.get_token`;
}


// OAuth2 configuration
const oauthConfig = {
  clientId,
  clientSecret,
  redirectUri,
  authorizationEndpoint,
  tokenEndpoint,
  scope
};

// Create axios instance for OAuth requests
const oauthClient = axios.create({
  baseURL: import.meta.env.VITE_ERPNEXT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Generate OAuth authorization URL
export const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    response_type: 'token',
    scope: oauthConfig.scope
  });

  console.log('OAuth Configuration:', {
    clientId: oauthConfig.clientId,
    clientSecret: oauthConfig.clientSecret ? '***' : 'missing',
    redirectUri: oauthConfig.redirectUri,
    authorizationEndpoint: oauthConfig.authorizationEndpoint,
    tokenEndpoint: oauthConfig.tokenEndpoint,
    scope: oauthConfig.scope
  });

  const url = `${oauthConfig.authorizationEndpoint}?${params.toString()}`;
  console.log('Generated Authorization URL:', url);
  return url;
};

// Exchange authorization code for access token
export const getAccessToken = async (code) => {
  try {
    console.log('Token Request Details:', {
      endpoint: oauthConfig.tokenEndpoint,
      clientId: oauthConfig.clientId,
      clientSecret: oauthConfig.clientSecret ? '***' : 'missing',
      redirectUri: oauthConfig.redirectUri,
      code: code
    });

    const response = await oauthClient.post(oauthConfig.tokenEndpoint, {
      grant_type: 'authorization_code',
      code,
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
      redirect_uri: oauthConfig.redirectUri
    });

    if (response.data.access_token) {
      // Store the token and its expiry
      localStorage.setItem('oauth_token', response.data.access_token);
      localStorage.setItem('oauth_token_expiry', Date.now() + (response.data.expires_in * 1000));
      return response.data.access_token;
    }
    throw new Error('No access token received');
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await oauthClient.post(oauthConfig.tokenEndpoint, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret
    });

    if (response.data.access_token) {
      localStorage.setItem('oauth_token', response.data.access_token);
      localStorage.setItem('oauth_token_expiry', Date.now() + (response.data.expires_in * 1000));
      return response.data.access_token;
    }
    throw new Error('No access token received');
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

// Get current access token (refreshes if needed)
export const getCurrentToken = async () => {
  const token = localStorage.getItem('oauth_token');
  const expiry = localStorage.getItem('oauth_token_expiry');
  const refreshToken = localStorage.getItem('oauth_refresh_token');

  if (!token || !expiry) {
    return null;
  }

  // If token is expired and we have a refresh token, try to refresh
  if (Date.now() > parseInt(expiry) && refreshToken) {
    try {
      return await refreshAccessToken(refreshToken);
    } catch (error) {
      // If refresh fails, clear tokens and return null
      localStorage.removeItem('oauth_token');
      localStorage.removeItem('oauth_token_expiry');
      localStorage.removeItem('oauth_refresh_token');
      return null;
    }
  }

  return token;
};

// Logout function
export const logout = () => {
  localStorage.removeItem('oauth_token');
  localStorage.removeItem('oauth_token_expiry');
  localStorage.removeItem('oauth_refresh_token');
  window.location.href = '/auth';
}; 