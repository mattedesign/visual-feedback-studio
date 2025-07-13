export type UserRole = 'designer' | 'developer' | 'marketing' | 'business' | 'product' | 'executive' | 'other';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole | null;
  onboarding_completed: boolean;
  super_admin: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  full_name?: string;
  role: UserRole;
}

export const ROLE_OPTIONS = [
  {
    value: 'designer' as UserRole,
    label: 'Designer',
    description: 'UI/UX designers, visual designers, design systems experts'
  },
  {
    value: 'developer' as UserRole,
    label: 'Developer',
    description: 'Frontend, backend, full-stack developers and engineers'
  },
  {
    value: 'marketing' as UserRole,
    label: 'Marketing',
    description: 'Marketing professionals, growth hackers, content creators'
  },
  {
    value: 'business' as UserRole,
    label: 'Business',
    description: 'Business analysts, strategists, operations professionals'
  },
  {
    value: 'product' as UserRole,
    label: 'Product',
    description: 'Product managers, product owners, product strategists'
  },
  {
    value: 'executive' as UserRole,
    label: 'Executive',
    description: 'C-level executives, directors, senior leadership'
  },
  {
    value: 'other' as UserRole,
    label: 'Other',
    description: 'Other roles or multiple responsibilities'
  }
];