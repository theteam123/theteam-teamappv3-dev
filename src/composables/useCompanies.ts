import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { supabase } from '../lib/supabase';
import type { Company, CompanyFormData } from '../lib/types';

export function useCompanies() {
  const authStore = useAuthStore();
  const companies = ref<Company[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCompanies = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select(`
          *,
          user_companies (
            count
          )
        `);

      if (fetchError) throw fetchError;

      companies.value = data.map(company => ({
        ...company,
        user_count: company.user_companies[0]?.count || 0
      }));
    } catch (err: any) {
      error.value = err.message;
      companies.value = [];
    } finally {
      loading.value = false;
    }
  };

  const createCompany = async (formData: CompanyFormData) => {
    loading.value = true;
    error.value = null;

    try {
      let settings;
      try {
        settings = JSON.parse(formData.settingsStr);
      } catch {
        settings = {};
      }

      const companyData = {
        name: formData.name,
        website: formData.website || null,
        settings
      };

      const { data: newCompany, error: insertError } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Add current user to the company
      const { error: userCompanyError } = await supabase
        .from('user_companies')
        .insert({
          user_id: authStore.user?.id,
          company_id: newCompany.id
        });

      if (userCompanyError) throw userCompanyError;

      // Assign admin role to the creator
      const { error: userRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authStore.user?.id,
          role_id: '00000000-0000-0000-0000-000000000001', // Admin role
          company_id: newCompany.id
        });

      if (userRoleError) throw userRoleError;

      await fetchCompanies();
      return newCompany;
    } catch (err: any) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateCompany = async (id: string, formData: CompanyFormData) => {
    loading.value = true;
    error.value = null;

    try {
      let settings;
      try {
        settings = JSON.parse(formData.settingsStr);
      } catch {
        settings = {};
      }

      const companyData = {
        name: formData.name,
        website: formData.website || null,
        settings
      };

      const { error: updateError } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchCompanies();
      return true;
    } catch (err: any) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchCompanies();
      return true;
    } catch (err: any) {
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  };
}