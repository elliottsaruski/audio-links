import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Dashboard from '@/components/dashboard/Dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, tracksRes, linksRes, releasesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('tracks').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('links').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('upcoming_releases').select('*').eq('user_id', user.id).order('release_date'),
  ])

  if (!profileRes.data) redirect('/onboarding')

  return (
    <Dashboard
      profile={profileRes.data}
      tracks={tracksRes.data ?? []}
      links={linksRes.data ?? []}
      releases={releasesRes.data ?? []}
      userId={user.id}
    />
  )
}
