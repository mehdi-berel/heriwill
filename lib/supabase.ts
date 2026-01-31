import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file.'
  )
}

// Client-side Supabase client (for use in Client Components)
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
}

// Server-side Supabase client (for use in Server Components, API Routes, Server Actions)
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Legacy export for backward compatibility (browser client)
// DEPRECATED: Use createClient() instead
export const supabase = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
