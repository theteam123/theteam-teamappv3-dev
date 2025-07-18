import axios from 'axios';
import { getErpNextApiUrl } from '../utils/api';
import { getOAuthConfig } from '../config/domains';

// Get OAuth configuration
const oauthConfig = getOAuthConfig();

// OAuth2 configuration
const config = {
  clientId: oauthConfig.clientId,
  clientSecret: oauthConfig.clientSecret,
  redirectUri: oauthConfig.redirectUri,
  authorizationEndpoint: `${getErpNextApiUrl()}/api/method/frappe.integrations.oauth2.authorize`,
  tokenEndpoint: `${getErpNextApiUrl()}/api/method/frappe.integrations.oauth2.get_token`,
  scope: 'all openid'
};

// Create axios instance for OAuth requests
const oauthClient = axios.create({
  baseURL: getErpNextApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Generate OAuth authorization URL
export const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'token',
    scope: config.scope
  });

  console.log('OAuth Configuration:', {
    clientId: config.clientId,
    clientSecret: config.clientSecret ? '***' : 'missing',
    redirectUri: config.redirectUri,
    authorizationEndpoint: config.authorizationEndpoint,
    tokenEndpoint: config.tokenEndpoint,
    scope: config.scope
  });

  const url = `${config.authorizationEndpoint}?${params.toString()}`;
  console.log('Generated Authorization URL:', url);
  return url;
};

// Exchange authorization code for access token
export const getAccessToken = async (code) => {
  try {
    console.log('Token Request Details:', {
      endpoint: config.tokenEndpoint,
      clientId: config.clientId,
      clientSecret: config.clientSecret ? '***' : 'missing',
      redirectUri: config.redirectUri,
      code: code
    });

    const response = await oauthClient.post(config.tokenEndpoint, {
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri
    });

    if (response.data.access_token) {
      // Store the token and its expiry
      localStorage.setItem('oauth_token', response.data.access_token);
      // Set expiry to 1 hour from now (3600 seconds)
      const expiryTime = Date.now() + (3600 * 1000);
      console.log('Token expiry set to:', new Date(expiryTime).toISOString());
      localStorage.setItem('oauth_token_expiry', expiryTime);
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
    const response = await oauthClient.post(config.tokenEndpoint, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret
    });

    if (response.data.access_token) {
      localStorage.setItem('oauth_token', response.data.access_token);
      // Set expiry to 1 hour from now (3600 seconds)
      const expiryTime = Date.now() + (3600 * 1000);
      // console.log('Token expiry set to:', new Date(expiryTime).toISOString());
      localStorage.setItem('oauth_token_expiry', expiryTime);
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
    console.log('No token or expiry found');
    return null;
  }

  const expiryTime = parseInt(expiry);
  const now = Date.now();
  // console.log('Token expiry check:', {
  //   expiryTime: new Date(expiryTime).toISOString(),
  //   now: new Date(now).toISOString(),
  //   isExpired: now > expiryTime
  // });

  // If token is expired and we have a refresh token, try to refresh
  if (now > expiryTime && refreshToken) {
    console.log('Token expired, attempting refresh');
    try {
      return await refreshAccessToken(refreshToken);
    } catch (error) {
      console.error('Token refresh failed:', error);
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