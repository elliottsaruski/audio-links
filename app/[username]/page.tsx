import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfilePage from '@/components/profile/ProfilePage'

interface Props {
  params: Promise<{ username: string }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', username)
    .single()

  if (!profile) notFound()

  const [tracksRes, linksRes, releasesRes] = await Promise.all([
    supabase.from('tracks').select('*').eq('user_id', profile.user_id).order('sort_order'),
    supabase.from('links').select('*').eq('user_id', profile.user_id).order('sort_order'),
    supabase
      .from('upcoming_releases')
      .select('*')
      .eq('user_id', profile.user_id)
      .order('release_date'),
  ])

  return (
    <ProfilePage
      profile={profile}
      tracks={tracksRes.data ?? []}
      links={linksRes.data ?? []}
      releases={releasesRes.data ?? []}
    />
  )
}
