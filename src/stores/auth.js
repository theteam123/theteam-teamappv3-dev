import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    roles: ['admin'],
    permissions: ['admin'],
    loading: false,
    error: null,
    availableCompanies: [
      {
        id: '1',
        name: 'Admin Company',
        website: 'https://admin.example.com'
      }
    ],
    currentCompanyId: '1'
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    hasPermission: (state) => (permission) => state.permissions.includes(permission),
    currentCompany: (state) => state.availableCompanies.find(c => c.id === state.currentCompanyId)
  },

  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        // If we have a user in localStorage, restore the session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          this.user = JSON.parse(storedUser);
          this.session = { user: this.user };
        }
      } catch (error) {
        this.error = error.message;
        this.resetState();
      } finally {
        this.loading = false;
      }
    },

    async signIn(email, password) {
      this.loading = true;
      try {
        // Static authentication
        if (email === 'admin@admin.com' && password === 'admin') {
          this.user = {
            id: '1',
            email: 'admin@admin.com',
            name: 'Admin User',
            role: 'admin',
            profile: {
              full_name: 'Admin User',
              avatar_url: 'https://www.gravatar.com/avatar/?d=mp'
            }
          };
          this.session = { user: this.user };
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(this.user));
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signUp(email, password, fullName) {
      this.loading = true;
      try {
        // Static registration
        if (email && password && fullName) {
          this.user = {
            id: '1',
            email: email,
            name: fullName,
            role: 'user',
            profile: {
              full_name: fullName,
              avatar_url: 'https://www.gravatar.com/avatar/?d=mp'
            }
          };
          this.session = { user: this.user };
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(this.user));
        } else {
          throw new Error('Invalid registration data');
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signOut() {
      this.loading = true;
      try {
        // Clear localStorage
        localStorage.removeItem('user');
        this.resetState();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    resetState() {
      this.user = null;
      this.session = null;
      this.roles = [];
      this.permissions = [];
      this.availableCompanies = [];
      this.currentCompanyId = null;
      this.error = null;
    },

    clearError() {
      this.error = null;
    },

    setCurrentCompany(companyId) {
      this.currentCompanyId = companyId;
    }
  }
});