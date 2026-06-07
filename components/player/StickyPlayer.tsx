'use client'

import Image from 'next/image'
import { usePlayerStore } from '@/lib/player-store'
import { Tables } from '@/types/database'
import WaveformPlayer from './WaveformPlayer'

type Track = Tables<'tracks'>

function PlayerInner({ track }: { track: Track }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-800 flex items-center gap-3 px-4 z-50">
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
        {track.cover_url ? (
          <Image
            src={track.cover_url}
            alt={track.title}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">♪</span>
        )}
      </div>

      {/* Title / artist */}
      <div className="w-28 flex-shrink-0 min-w-0">
        <p className="text-xs font-medium text-white truncate">{track.title}</p>
        {track.artist && <p className="text-xs text-zinc-500 truncate">{track.artist}</p>}
      </div>

      {/* Waveform + controls */}
      <div className="flex-1 min-w-0">
        <WaveformPlayer track={track} />
      </div>
    </div>
  )
}

export default function StickyPlayer() {
  const currentTrack = usePlayerStore(s => s.currentTrack)
  if (!currentTrack) return null
  // key forces a fresh Wavesurfer instance when the track changes
  return <PlayerInner key={currentTrack.id} track={currentTrack} />
}
