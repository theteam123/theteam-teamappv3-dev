import { defineStore } from 'pinia';
import { getAuthorizationUrl, getCurrentToken, logout as oauthLogout } from '../services/oauth';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Try to get persisted state from localStorage
    const persistedState = localStorage.getItem('authState');
    const initialState = {
      user: null,
      loading: false,
      error: null,
      isLoggedIn: false,
      isSystemManager: false
    };

    return persistedState ? JSON.parse(persistedState) : initialState;
  },

  getters: {
    isAuthenticated: (state) => {
      return state.isLoggedIn;
    }
  },

  actions: {
    async signIn() {
      this.loading = true;
      this.error = null;
      
      try {
        // Redirect to OAuth authorization page

        window.location.href = getAuthorizationUrl();
      } catch (error) {
        console.error('Error during sign in:', error);
        this.error = error.message || 'Failed to authenticate';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async setToken(token) {
      try {
        console.log('Auth Store - Setting token...');
        
        // Store token in localStorage first
        localStorage.setItem('oauth_token', token);
        localStorage.setItem('oauth_token_expiry', Date.now() + (3600 * 1000)); // 1 hour expiry
        
        // Determine which API URL to use based on domain
        const currentDomain = window.location.hostname;
        const apiUrl = currentDomain.includes('teamsite-taktec') 
          ? import.meta.env.VITE_ERPNEXT_TAKTEC_API_URL 
          : import.meta.env.VITE_ERPNEXT_API_URL;
        
        // Get user info using the token
        console.log('Auth Store - Fetching user info...');
        const response = await fetch(`${apiUrl}/api/method/frappe.auth.get_logged_user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Auth Store - User info response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Auth Store - User info error:', errorData);
          throw new Error('Failed to get user info');
        }

        const userData = await response.json();
        console.log('Auth Store - User info received:', userData);

        // Get user roles to verify identity
        const rolesResponse = await fetch(`${apiUrl}/api/method/frappe.core.doctype.user.user.get_roles`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: userData.message
          })
        });

        if (!rolesResponse.ok) {
          console.error('Auth Store - Roles verification failed:', await rolesResponse.json());
          throw new Error('Failed to verify user roles');
        }

        const rolesData = await rolesResponse.json();
        console.log('Auth Store - User roles:', rolesData);

        // Update state with verified user info
        this.user = {
          name: userData.message,
          email: userData.message,
          roles: rolesData.message || [],
          profile: {
            full_name: userData.message.split('@')[0],
            image: `https://www.gravatar.com/avatar/${userData.message}?d=identicon`
          }
        };
        
        this.isLoggedIn = true;
        this.isSystemManager = rolesData.message?.includes('System Manager') || false;
        
        console.log('Auth Store - State updated:', {
          user: this.user,
          isLoggedIn: this.isLoggedIn,
          isSystemManager: this.isSystemManager
        });
        
        // Persist state before any redirects
        this.persistState();
        console.log('Auth Store - State persisted');
        
        // Verify token is stored
        const storedToken = localStorage.getItem('oauth_token');
        console.log('Auth Store - Token verification:', storedToken ? 'Present' : 'Missing');
        
        return true;
      } catch (error) {
        console.error('Auth Store - Error setting token:', error);
        this.error = error.message;
        // Clear token on error
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('oauth_token_expiry');
        return false;
      }
    },

    async checkSystemManagerRole() {
      try {
        const token = await getCurrentToken();
        if (!token) {
          this.isSystemManager = false;
          return false;
        }

        const response = await fetch(`${import.meta.env.VITE_ERPNEXT_API_URL}/api/method/frappe.core.doctype.user.user.get_roles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to get user roles');
        }

        const data = await response.json();
        this.isSystemManager = data.message.includes('System Manager');
        this.persistState();
        return this.isSystemManager;
      } catch (error) {
        console.error('Error checking System Manager role:', error);
        this.isSystemManager = false;
        return false;
      }
    },

    async signOut() {
      this.loading = true;
      try {
        await oauthLogout();
        this.resetState();
      } catch (error) {
        console.error('Error during sign out:', error);
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.user = null;
      this.error = null;
      this.isLoggedIn = false;
      this.isSystemManager = false;
      localStorage.removeItem('authState');
    },

    clearError() {
      this.error = null;
    },

    persistState() {
      const stateToPersist = {
        user: this.user,
        isLoggedIn: this.isLoggedIn,
        isSystemManager: this.isSystemManager
      };
      localStorage.setItem('authState', JSON.stringify(stateToPersist));
    }
  }
});