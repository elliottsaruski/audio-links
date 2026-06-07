'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(data: {
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  background_url?: string | null
}): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('profiles').update(data).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

// ── Tracks ───────────────────────────────────────────────────────────────────

export async function addTrack(data: {
  title: string
  artist?: string | null
  audio_url: string
  cover_url?: string | null
  waveform_peaks?: unknown
}): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { count } = await supabase
    .from('tracks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 10) return { error: "You've reached the 10-track limit." }

  const { error } = await supabase.from('tracks').insert({
    ...data,
    user_id: user.id,
    sort_order: count ?? 0,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return {}
}

export async function deleteTrack(id: string): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('tracks').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

export async function setPinnedTrack(id: string | null): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error: unpinErr } = await supabase
    .from('tracks')
    .update({ is_pinned: false })
    .eq('user_id', user.id)

  if (unpinErr) return { error: unpinErr.message }

  if (id) {
    const { error: pinErr } = await supabase
      .from('tracks')
      .update({ is_pinned: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (pinErr) return { error: pinErr.message }
  }

  revalidatePath('/dashboard')
  return {}
}

// ── Links ────────────────────────────────────────────────────────────────────

export async function addLink(data: {
  title: string
  url: string
  sort_order: number
}): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('links').insert({ ...data, user_id: user.id })
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

export async function updateLink(
  id: string,
  data: { title?: string; url?: string; sort_order?: number }
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('links').update(data).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

export async function deleteLink(id: string): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('links').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

export async function reorderLinks(ids: string[]): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const results = await Promise.all(
    ids.map((id, index) =>
      supabase.from('links').update({ sort_order: index }).eq('id', id).eq('user_id', user.id)
    )
  )

  const failed = results.find(r => r.error)
  if (failed?.error) return { error: failed.error.message }

  revalidatePath('/dashboard')
  return {}
}

// ── Releases ─────────────────────────────────────────────────────────────────

export async function addRelease(data: {
  title: string
  cover_url?: string | null
  release_date?: string | null
  presave_url?: string | null
}): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.from('upcoming_releases').insert({ ...data, user_id: user.id })
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

export async function updateRelease(
  id: string,
  data: {
    title?: string
    cover_url?: string | null
    release_date?: string | null
    presave_url?: string | null
  }
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('upcoming_releases')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

export async function deleteRelease(id: string): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('upcoming_releases')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}
