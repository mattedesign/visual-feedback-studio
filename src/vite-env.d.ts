
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_MONTHLY_PRICE_ID: string
  readonly VITE_STRIPE_YEARLY_PRICE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Global window extensions for Supabase environment variables
declare global {
  interface Window {
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
  }
}
