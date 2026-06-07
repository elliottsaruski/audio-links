import { create } from 'zustand'
import { Tables } from '@/types/database'

type Track = Tables<'tracks'>

interface PlayerStore {
  currentTrack: Track | null
  isPlaying: boolean
  selectTrack: (track: Track) => void
  setPlaying: (isPlaying: boolean) => void
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  selectTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  setPlaying: (isPlaying) => set({ isPlaying }),
}))
