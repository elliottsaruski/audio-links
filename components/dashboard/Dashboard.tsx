'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tables } from '@/types/database'
import ProfileTab from './ProfileTab'
import TracksTab from './TracksTab'
import LinksTab from './LinksTab'
import ReleasesTab from './ReleasesTab'

type Profile = Tables<'profiles'>
type Track = Tables<'tracks'>
type LinkRow = Tables<'links'>
type Release = Tables<'upcoming_releases'>

interface Props {
  profile: Profile
  tracks: Track[]
  links: LinkRow[]
  releases: Release[]
  userId: string
}

export default function Dashboard({ profile, tracks, links, releases, userId }: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-zinc-400 text-sm font-mono">/{profile.handle}</span>
        <Link
          href={`/${profile.handle}`}
          target="_blank"
          className="text-xs text-zinc-500 hover:text-white underline underline-offset-2"
        >
          View page ↗
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Tabs defaultValue="profile">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="releases">Releases</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab profile={profile} userId={userId} />
          </TabsContent>

          <TabsContent value="tracks">
            <TracksTab tracks={tracks} userId={userId} />
          </TabsContent>

          <TabsContent value="releases">
            <ReleasesTab releases={releases} userId={userId} />
          </TabsContent>

          <TabsContent value="links">
            <LinksTab links={links} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
