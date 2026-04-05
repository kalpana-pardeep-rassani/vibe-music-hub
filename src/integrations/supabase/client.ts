import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://arwgbowbhgjqnkfwqbvf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd2dib3diaGdqcW5rZndxYnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzI2ODAsImV4cCI6MjA5MDYwODY4MH0.MXiauG3rMLQle5yCGwnYZSeldvfJwwgg2LmSp3jJW0U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});