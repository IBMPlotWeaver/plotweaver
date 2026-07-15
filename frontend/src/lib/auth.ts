import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    // If there's no session, getUser returns an error. We should return null instead of throwing.
    return null
  }
  return data.user
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
