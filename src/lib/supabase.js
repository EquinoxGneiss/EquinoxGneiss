import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Missing environment variables. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

// Implicit flow: Supabase sends #access_token=... in the URL hash.
// PKCE would require the code verifier to be in the *same browser* that
// initiated the request — this breaks when an email client opens the link
// in a different browser ("invalid flow state" error).
// signInWithPassword is unaffected by flowType.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    detectSessionInUrl: false,
  },
})
