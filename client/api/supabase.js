// api/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase client env. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env, then restart Vite.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
