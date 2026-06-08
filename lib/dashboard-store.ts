import { create } from 'zustand'
import { Tables } from '@/types/database'

type Profile = Tables<'profiles'>
type Track = Tables<'tracks'>
type Link = Tables<'links'>
type Release = Tables<'upcoming_releases'>

export type TrackLink = {
  platform: 'spotify' | 'apple_music' | 'tidal' | 'youtube' | 'soundcloud' | 'bandcamp'
  url: string
}

interface DashboardStore {
  // Profile fields (draft — not persisted until save)
  display_name: string
  bio: string
  avatar_url: string | null
  background_url: string | null
  location: string | null
  theme: string
  accent_color: string
  card_color: string
  text_color: string
  wrapper_color: string

  // Content (kept in sync with DB after each mutation)
  tracks: Track[]
  links: Link[]
  releases: Release[]

  // Save state
  isDirty: boolean
  isSaving: boolean

  // Hydrate from server-fetched data (call once on dashboard mount)
  hydrateProfile: (profile: Profile, tracks: Track[], links: Link[], releases: Release[]) => void

  // Profile field setters — each marks isDirty
  setDisplayName: (v: string) => void
  setBio: (v: string) => void
  setAvatarUrl: (v: string | null) => void
  setBackgroundUrl: (v: string | null) => void
  setLocation: (v: string | null) => void
  setTheme: (v: string) => void
  setAccentColor: (v: string) => void
  setCardColor: (v: string) => void
  setTextColor: (v: string) => void
  setWrapperColor: (v: string) => void

  // Content setters — sync store after DB mutations (do not mark dirty)
  setTracks: (tracks: Track[]) => void
  setLinks: (links: Link[]) => void
  setReleases: (releases: Release[]) => void

  // Save lifecycle
  setIsSaving: (v: boolean) => void
  markSaved: () => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  display_name: '',
  bio: '',
  avatar_url: null,
  background_url: null,
  location: null,
  theme: 'dark',
  accent_color: '#ffffff',
  card_color: '#1a1a1a',
  text_color: '#ffffff',
  wrapper_color: '#0a0a0a',

  tracks: [],
  links: [],
  releases: [],

  isDirty: false,
  isSaving: false,

  hydrateProfile: (profile, tracks, links, releases) =>
    set({
      display_name: profile.display_name ?? '',
      bio: profile.bio ?? '',
      avatar_url: profile.avatar_url,
      background_url: profile.background_url,
      location: profile.location,
      theme: profile.theme ?? 'dark',
      accent_color: profile.accent_color ?? '#ffffff',
      card_color: profile.card_color ?? '#1a1a1a',
      text_color: profile.text_color ?? '#ffffff',
      wrapper_color: profile.wrapper_color ?? '#0a0a0a',
      tracks,
      links,
      releases,
      isDirty: false,
      isSaving: false,
    }),

  setDisplayName: (v) => set({ display_name: v, isDirty: true }),
  setBio: (v) => set({ bio: v, isDirty: true }),
  setAvatarUrl: (v) => set({ avatar_url: v, isDirty: true }),
  setBackgroundUrl: (v) => set({ background_url: v, isDirty: true }),
  setLocation: (v) => set({ location: v, isDirty: true }),
  setTheme: (v) => set({ theme: v, isDirty: true }),
  setAccentColor: (v) => set({ accent_color: v, isDirty: true }),
  setCardColor: (v) => set({ card_color: v, isDirty: true }),
  setTextColor: (v) => set({ text_color: v, isDirty: true }),
  setWrapperColor: (v) => set({ wrapper_color: v, isDirty: true }),

  setTracks: (tracks) => set({ tracks }),
  setLinks: (links) => set({ links }),
  setReleases: (releases) => set({ releases }),

  setIsSaving: (isSaving) => set({ isSaving }),
  markSaved: () => set({ isDirty: false, isSaving: false }),
}))
