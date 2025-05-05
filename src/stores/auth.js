import { defineStore } from 'pinia';
import { login, erp } from '../services/erpnext';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Try to get persisted state from localStorage
    const persistedState = localStorage.getItem('authState');
    const initialState = {
      user: null,
      session: null,
      roles: [],
      permissions: [],
      loading: false,
      error: null,
      availableCompanies: [],
      currentCompanyId: null,
      isLoggedIn: false,
      isSystemManager: false
    };

    return persistedState ? JSON.parse(persistedState) : initialState;
  },

  getters: {
    isAuthenticated: (state) => {
      // Check both localStorage and state
      const persistedState = localStorage.getItem('authState');
      const isPersisted = persistedState ? JSON.parse(persistedState).isLoggedIn : false;
      return state.isLoggedIn || isPersisted;
    },
    hasPermission: (state) => (permission) => state.permissions.includes(permission),
    currentCompany: (state) => state.availableCompanies.find(c => c.id === state.currentCompanyId)
  },

  actions: {
    async checkSystemManagerRole() {
      try {
        // Get current user's roles from the User doctype using API key
        const res = await erp.get(`/api/resource/User/${this.user.email}`, {
          headers: {
            'Authorization': `token ${import.meta.env.VITE_ERPNEXT_API_KEY}:${import.meta.env.VITE_ERPNEXT_API_SECRET}`
          }
        });
        // Extract roles from the response - roles is an array of objects with a 'role' property
        const roles = res.data.roles || [];
        const roleNames = roles.map(roleObj => roleObj.role);
        console.log('Roles:', roleNames);
        this.isSystemManager = roleNames.includes("System Manager");
        return this.isSystemManager;
      } catch (error) {
        console.error('Error checking System Manager role:', error);
        this.isSystemManager = false;
        return false;
      }
    },

    async signIn(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        // Login to ERPNext
        const userData = await login(email, password);
        
        if (!userData.message) {
          throw new Error('Invalid response from server');
        }

        // Update state with the full user data
        this.user = {
          email: email,
          profile: {
            full_name: userData.full_name || email.split('@')[0],
            image: `https://www.gravatar.com/avatar/${email}?d=identicon`
          }
        };

        // Set login state
        this.isLoggedIn = true;
        
        // Check for System Manager role after successful login
        await this.checkSystemManagerRole();
        
        // Persist state to localStorage
        this.persistState();
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Failed to authenticate. Please check your credentials.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async signOut() {
      this.loading = true;
      try {
        // Clear the session by removing cookies
        document.cookie = 'sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        this.resetState();
        this.isLoggedIn = false;
        // Clear persisted state
        localStorage.removeItem('authState');
      } catch (error) {
        console.error('Error during sign out:', error);
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.user = null;
      this.session = null;
      this.roles = [];
      this.permissions = [];
      this.error = null;
      this.availableCompanies = [];
      this.currentCompanyId = null;
      this.isLoggedIn = false;
      this.isSystemManager = false;
      // Clear persisted state
      localStorage.removeItem('authState');
    },

    clearError() {
      this.error = null;
    },

    setCurrentCompany(companyId) {
      this.currentCompanyId = companyId;
      this.persistState();
    },

    // Helper method to persist state
    persistState() {
      const stateToPersist = {
        user: this.user,
        isLoggedIn: this.isLoggedIn,
        currentCompanyId: this.currentCompanyId,
        availableCompanies: this.availableCompanies,
        isSystemManager: this.isSystemManager
      };
      localStorage.setItem('authState', JSON.stringify(stateToPersist));
    }
  }
});