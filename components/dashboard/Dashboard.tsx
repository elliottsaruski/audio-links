'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Tables } from '@/types/database'
import { useDashboardStore } from '@/lib/dashboard-store'
import { updateProfile } from '@/app/dashboard/actions'
import ProfileTab from './ProfileTab'
import CustomizeTab from './CustomizeTab'
import TracksTab from './TracksTab'
import LinksTab from './LinksTab'
import ReleasesTab from './ReleasesTab'
import PhonePreview from './PhonePreview'

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
  const hydrateProfile = useDashboardStore(s => s.hydrateProfile)
  const setTracks = useDashboardStore(s => s.setTracks)
  const setLinks = useDashboardStore(s => s.setLinks)
  const setReleases = useDashboardStore(s => s.setReleases)
  const isDirty = useDashboardStore(s => s.isDirty)
  const isSaving = useDashboardStore(s => s.isSaving)
  const setIsSaving = useDashboardStore(s => s.setIsSaving)
  const markSaved = useDashboardStore(s => s.markSaved)

  // Hydrate profile fields once on mount
  useEffect(() => {
    hydrateProfile(profile, tracks, links, releases)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep content arrays in sync after server mutations (router.refresh())
  // without touching the dirty profile field drafts
  useEffect(() => { setTracks(tracks) }, [tracks, setTracks])
  useEffect(() => { setLinks(links) }, [links, setLinks])
  useEffect(() => { setReleases(releases) }, [releases, setReleases])

  async function handleSave() {
    setIsSaving(true)
    const s = useDashboardStore.getState()
    const { error } = await updateProfile({
      display_name: s.display_name || null,
      bio: s.bio || null,
      avatar_url: s.avatar_url,
      background_url: s.background_url,
      location: s.location,
      theme: s.theme,
      accent_color: s.accent_color,
      card_color: s.card_color,
      text_color: s.text_color,
      wrapper_color: s.wrapper_color,
    })
    if (error) {
      setIsSaving(false)
    } else {
      markSaved()
    }
  }

  return (
    <>
      {/* Mobile redirect */}
      <div className="md:hidden min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-8 gap-5">
        <p className="text-zinc-300 text-sm leading-relaxed">
          The dashboard works best on desktop. Visit your profile page to see how it looks on mobile.
        </p>
        <Link
          href={`/${profile.handle}`}
          className="text-sm text-zinc-400 underline underline-offset-2 hover:text-white"
        >
          View your profile →
        </Link>
      </div>

      {/* Desktop two-column layout */}
      <div className="hidden md:flex h-screen overflow-hidden bg-zinc-950 text-white">
        {/* Left panel — scrollable */}
        <div className="flex flex-col border-r border-zinc-800" style={{ width: '45%' }}>
          {/* Header */}
          <header className="shrink-0 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-mono">/{profile.handle}</span>
            <div className="flex items-center gap-4">
              {isDirty && (
                <span className="text-xs text-zinc-500">Unsaved changes</span>
              )}
              <Link
                href={`/${profile.handle}`}
                target="_blank"
                className="text-xs text-zinc-500 hover:text-white underline underline-offset-2"
              >
                View page ↗
              </Link>
            </div>
          </header>

          {/* Tabs — scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <Tabs defaultValue="profile">
              <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap h-auto gap-0.5 p-1">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="customize">Customize</TabsTrigger>
                <TabsTrigger value="tracks">Tracks</TabsTrigger>
                <TabsTrigger value="releases">Releases</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileTab userId={userId} />
              </TabsContent>

              <TabsContent value="customize">
                <CustomizeTab />
              </TabsContent>

              <TabsContent value="tracks">
                <TracksTab userId={userId} />
              </TabsContent>

              <TabsContent value="releases">
                <ReleasesTab userId={userId} />
              </TabsContent>

              <TabsContent value="links">
                <LinksTab />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky save bar */}
          <div className="shrink-0 border-t border-zinc-800 px-6 py-3 flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
            {isDirty && (
              <span className="text-xs text-zinc-600">Profile fields only — tracks and links save immediately</span>
            )}
          </div>
        </div>

        {/* Right panel — phone preview */}
        <div className="flex-1 h-full flex flex-col items-center justify-center gap-3 overflow-hidden">
          <PhonePreview handle={profile.handle} />
          <Link
            href={`/${profile.handle}`}
            target="_blank"
            className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2"
          >
            Open live page →
          </Link>
        </div>
      </div>
    </>
  )
}
