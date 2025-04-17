import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  current_company_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile extends User {
  profile: Profile;
}

export interface CompanyUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  active: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  settings: Record<string, any>;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyFormData {
  name: string;
  website: string;
  settings: string;
}