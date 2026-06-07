'use client'

import Image from 'next/image'
import { Tables } from '@/types/database'
import { usePlayerStore } from '@/lib/player-store'

type Track = Tables<'tracks'>

export default function TrackList({ tracks }: { tracks: Track[] }) {
  const selectTrack = usePlayerStore(s => s.selectTrack)
  const currentTrack = usePlayerStore(s => s.currentTrack)

  if (tracks.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {tracks.map(track => {
        const isActive = currentTrack?.id === track.id
        return (
          <button
            key={track.id}
            onClick={() => selectTrack(track)}
            className={`flex items-center gap-3 p-3 rounded-lg text-left transition w-full ${
              isActive
                ? 'bg-zinc-800 ring-1 ring-purple-500/40'
                : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {/* Cover */}
            <div className="w-10 h-10 rounded bg-zinc-700 shrink-0 overflow-hidden">
              {track.cover_url ? (
                <Image
                  src={track.cover_url}
                  alt={track.title}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">♪</span>
              )}
            </div>

            {/* Title / artist */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{track.title}</p>
              {track.artist && (
                <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
              )}
            </div>

            {/* Play indicator */}
            <span className={`text-xs shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-600'}`}>
              {isActive ? '▶' : '›'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
