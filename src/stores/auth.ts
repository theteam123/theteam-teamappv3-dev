import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../lib/types';

interface AuthState {
  user: User | null;
  session: any;
  roles: string[];
  permissions: string[];
  loading: boolean;
  error: string | null;
  availableCompanies: any[];
  currentCompanyId: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    roles: [],
    permissions: [],
    loading: false,
    error: null,
    availableCompanies: [],
    currentCompanyId: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.session,
    hasPermission: (state) => (permission: string) => {
      console.log('Checking permission:', {
        permission,
        availablePermissions: state.permissions,
        hasPermission: state.permissions.includes(permission)
      });
      return state.permissions.includes(permission);
    },
    currentCompany: (state) => state.availableCompanies.find(c => c.id === state.currentCompanyId)
  },

  actions: {
    async fetchUser() {
      console.log('fetchUser started');
      this.loading = true;
      try {
        const { data: { user, session }, error } = await supabase.auth.getSession();
        console.log('Auth session result:', { user: !!user, session: !!session, error });

        if (error) throw error;

        if (user && session) {
          this.user = user;
          this.session = session;

          // Fetch all user data in parallel
          await Promise.all([
            this.fetchUserProfile(user.id),
            this.fetchAvailableCompanies(user.id)
          ]);

          // Set current company ID if not already set
          if (!this.currentCompanyId && this.availableCompanies.length > 0) {
            const defaultCompanyId = this.user?.profile?.current_company_id || this.availableCompanies[0].id;
            await this.setCurrentCompany(defaultCompanyId);
          }

          // Fetch roles and permissions after company is set
          await this.fetchUserRolesAndPermissions(user.id);

          console.log('User data loaded:', {
            hasProfile: !!this.user?.profile,
            rolesCount: this.roles.length,
            companiesCount: this.availableCompanies.length,
            currentCompanyId: this.currentCompanyId,
            permissions: this.permissions
          });
        } else {
          this.resetState();
        }
      } catch (error: any) {
        console.error('fetchUser error:', error);
        this.error = error.message;
        this.resetState();
        throw error;
      } finally {
        this.loading = false;
        console.log('fetchUser completed');
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

    async fetchUserProfile(userId: string) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (this.user) {
          this.user = { ...this.user, profile } as User;
        }
        
        return profile;
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },

    async fetchUserRolesAndPermissions(userId: string) {
      try {
        console.log('Fetching roles and permissions for:', {
          userId,
          currentCompanyId: this.currentCompanyId
        });

        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select(`
            role_id,
            company_id,
            roles (
              id,
              name,
              role_permissions (
                permission_key
              )
            )
          `)
          .eq('user_id', userId)
          .eq('company_id', this.currentCompanyId);

        if (userRolesError) throw userRolesError;

        console.log('User roles result:', userRoles);

        this.roles = userRoles.map(ur => ur.roles.name);
        this.permissions = userRoles.flatMap(ur => 
          ur.roles.role_permissions.map(rp => rp.permission_key)
        );

        console.log('Updated permissions state:', {
          roles: this.roles,
          permissions: this.permissions
        });
        
        return userRoles;
      } catch (error: any) {
        console.error('Error in fetchUserRolesAndPermissions:', error);
        this.roles = [];
        this.permissions = [];
        throw error;
      }
    },

    async fetchAvailableCompanies(userId: string) {
      try {
        const { data: companies, error } = await supabase
          .from('user_companies')
          .select(`
            company_id,
            companies (
              id,
              name,
              website
            )
          `)
          .eq('user_id', userId);

        if (error) throw error;

        this.availableCompanies = companies.map(uc => ({
          id: uc.companies.id,
          name: uc.companies.name,
          website: uc.companies.website
        }));
        
        return companies;
      } catch (error: any) {
        console.error('Error fetching available companies:', error);
        throw error;
      }
    },

    async setCurrentCompany(companyId: string) {
      this.loading = true;
      try {
        console.log('Setting current company:', companyId);

        const { error } = await supabase
          .from('profiles')
          .update({ current_company_id: companyId })
          .eq('id', this.user?.id);

        if (error) throw error;

        this.currentCompanyId = companyId;
        if (this.user?.profile) {
          this.user.profile.current_company_id = companyId;
        }

        // Refresh roles and permissions for new company context
        await this.fetchUserRolesAndPermissions(this.user?.id || '');

        console.log('Current company updated:', {
          companyId: this.currentCompanyId,
          roles: this.roles,
          permissions: this.permissions
        });
      } catch (error: any) {
        console.error('Error setting current company:', error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signUp(email: string, password: string, fullName: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error('User creation failed');

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName
          });

        if (profileError) throw profileError;

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: `${fullName}'s Company`
          })
          .select()
          .single();

        if (companyError) throw companyError;

        const { error: userCompanyError } = await supabase
          .from('user_companies')
          .insert({
            user_id: data.user.id,
            company_id: company.id
          });

        if (userCompanyError) throw userCompanyError;

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role_id: '00000000-0000-0000-0000-000000000001',
            company_id: company.id
          });

        if (roleError) throw roleError;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ current_company_id: company.id })
          .eq('id', data.user.id);

        if (updateError) throw updateError;

        this.user = data.user;
        this.session = data.session;
        await this.fetchUser();

      } catch (error: any) {
        this.error = error.message;
        this.resetState();
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signIn(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        this.user = user;
        this.session = session;

        if (user) {
          await Promise.all([
            this.fetchUserProfile(user.id),
            this.fetchAvailableCompanies(user.id)
          ]);

          // Set current company ID if not already set
          if (!this.currentCompanyId && this.availableCompanies.length > 0) {
            const defaultCompanyId = this.user?.profile?.current_company_id || this.availableCompanies[0].id;
            await this.setCurrentCompany(defaultCompanyId);
          }

          // Fetch roles and permissions after company is set
          await this.fetchUserRolesAndPermissions(user.id);
        }
      } catch (error: any) {
        this.error = error.message;
        this.resetState();
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async signOut() {
      this.loading = true;
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        this.resetState();
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  }
});