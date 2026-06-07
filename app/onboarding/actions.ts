'use server'

import { createClient } from '@/lib/supabase/server'

// 3–20 chars, starts and ends with alphanumeric, middle can contain hyphens/underscores
const HANDLE_REGEX = /^[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]$/

export async function claimHandle(handle: string): Promise<{ error?: string }> {
  if (!HANDLE_REGEX.test(handle)) {
    return { error: 'Handle must be 3–20 characters and can only contain letters, numbers, hyphens, and underscores.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('profiles').insert({
    user_id: user.id,
    handle,
  })

  if (error) {
    console.error('[claimHandle] Supabase error:', error)
    if (error.code === '23505') return { error: 'That handle is already taken.' }
    return { error: `Insert failed: ${error.message} (code ${error.code})` }
  }

  return {}
}
