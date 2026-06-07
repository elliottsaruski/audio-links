import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-zinc-400 text-sm">Logged in as</p>
        <p className="text-xl font-semibold">/{profile.handle}</p>
        <p className="text-zinc-500 text-sm">Dashboard coming soon</p>
      </div>
    </div>
  )
}
