'use client'

import { Tables } from '@/types/database'
import { usePlayerStore } from '@/lib/player-store'
import ProfileBanner from './ProfileBanner'
import ProfileAvatar from './ProfileAvatar'
import TrackList from './TrackList'
import StickyPlayer from '@/components/player/StickyPlayer'
import WaveformPlayer from '@/components/player/WaveformPlayer'

type Profile = Tables<'profiles'>
type Track = Tables<'tracks'>
type LinkRow = Tables<'links'>
type Release = Tables<'upcoming_releases'>

interface Props {
  profile: Profile
  tracks: Track[]
  links: LinkRow[]
  releases: Release[]
}

function WaveformBars({ peaks }: { peaks: number[] }) {
  const count = 80
  const step = Math.max(1, Math.floor(peaks.length / count))
  return (
    <svg viewBox={`0 0 ${count * 3} 32`} className="w-full h-8" preserveAspectRatio="none">
      {Array.from({ length: count }).map((_, i) => {
        const peak = peaks[i * step] ?? 0
        const h = Math.max(2, peak * 32)
        return (
          <rect
            key={i}
            x={i * 3}
            y={(32 - h) / 2}
            width={2}
            height={h}
            rx={1}
            fill="rgba(168,85,247,0.5)"
          />
        )
      })}
    </svg>
  )
}

export default function ProfilePage({ profile, tracks, links, releases }: Props) {
  const selectTrack = usePlayerStore(s => s.selectTrack)
  const currentTrack = usePlayerStore(s => s.currentTrack)

  const pinnedTrack = tracks.find(t => t.is_pinned) ?? null
  const otherTracks = tracks.filter(t => !t.is_pinned)
  const pinnedIsPlaying = currentTrack?.id === pinnedTrack?.id

  return (
    <>
      <div className="min-h-screen bg-zinc-950 pb-20">
        <div className="max-w-lg mx-auto my-10 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
          {/* Banner */}
          <ProfileBanner url={profile.background_url} />

          {/* Header */}
          <div className="px-5 py-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <ProfileAvatar url={profile.avatar_url} name={profile.display_name ?? profile.handle} />
              <div>
                <h1 className="text-lg font-semibold text-white leading-tight">
                  {profile.display_name ?? profile.handle}
                </h1>
                <p className="text-sm text-zinc-500">@{profile.handle}</p>
              </div>
            </div>
            {profile.bio && (
              <p className="text-sm text-zinc-400 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Links */}
          {links.length > 0 && (
            <div className="px-5 pb-5 flex flex-col gap-2">
              {links.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition"
                >
                  {link.title}
                </a>
              ))}
            </div>
          )}

          {/* Upcoming releases */}
          {releases.length > 0 && (
            <div className="px-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Upcoming</p>
              <div className="flex flex-col gap-2">
                {releases.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{r.title}</p>
                      {r.release_date && (
                        <p className="text-xs text-zinc-500">{r.release_date}</p>
                      )}
                    </div>
                    {r.presave_url && (
                      <a
                        href={r.presave_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition"
                      >
                        Pre-save
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pinned track */}
          {pinnedTrack && (
            <div className="px-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Featured</p>
              <div className="bg-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-700 shrink-0 overflow-hidden">
                    {pinnedTrack.cover_url ? (
                      <img
                        src={pinnedTrack.cover_url}
                        alt={pinnedTrack.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-zinc-500">♪</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{pinnedTrack.title}</p>
                    {pinnedTrack.artist && (
                      <p className="text-xs text-zinc-400">{pinnedTrack.artist}</p>
                    )}
                  </div>
                  <span className="text-yellow-400 text-xs shrink-0">★</span>
                </div>

                {/* Waveform: static visual if not playing, live player if playing */}
                {pinnedIsPlaying ? (
                  <WaveformPlayer key={pinnedTrack.id} track={pinnedTrack} />
                ) : pinnedTrack.waveform_peaks ? (
                  <button
                    onClick={() => selectTrack(pinnedTrack)}
                    className="w-full group relative"
                    title="Play"
                  >
                    <WaveformBars peaks={pinnedTrack.waveform_peaks as number[]} />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-sm">▶</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => selectTrack(pinnedTrack)}
                    className="w-full flex justify-center py-2 text-zinc-500 hover:text-white transition text-sm"
                  >
                    ▶ Play
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Track list */}
          {otherTracks.length > 0 && (
            <div className="px-5 pb-5">
              {(pinnedTrack || releases.length > 0) && (
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Tracks</p>
              )}
              <TrackList tracks={otherTracks} />
            </div>
          )}
        </div>
      </div>

      <StickyPlayer />
    </>
  )
}
