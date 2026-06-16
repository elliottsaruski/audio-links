'use client'

import Image from 'next/image'
import { useDashboardStore } from '@/lib/dashboard-store'
import { usePlayerStore } from '@/lib/player-store'

const PHONE_W = 375
const PHONE_H = 812
const SCALE = 0.72

const PLATFORM_LABELS: Record<string, string> = {
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  bandcamp: 'Bandcamp',
  website: 'Website',
}

export default function PhonePreview({ handle }: { handle: string }) {
  const store = useDashboardStore()
  const currentTrack = usePlayerStore(s => s.currentTrack)
  const selectTrack = usePlayerStore(s => s.selectTrack)

  const pinnedTrack = store.tracks.find(t => t.is_pinned) ?? null
  const otherTracks = store.tracks.filter(t => !t.is_pinned)
  const filledLinks = store.links.filter(l => l.url)

  return (
    <div style={{ width: PHONE_W * SCALE, height: PHONE_H * SCALE, position: 'relative' }}>
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* Phone bezel */}
        <div
          className="absolute inset-0 shadow-2xl overflow-hidden"
          style={{
            borderRadius: 44,
            border: '4px solid #3f3f46',
            backgroundColor: store.wrapper_color,
          }}
        >
          {/* Notch */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10"
            style={{
              width: 120,
              height: 28,
              backgroundColor: '#09090b',
              borderRadius: '0 0 20px 20px',
            }}
          />

          {/* Scrollable content */}
          <div
            className="absolute inset-0 overflow-y-auto"
            style={{
              paddingTop: 36,
              scrollbarWidth: 'none',
              color: store.text_color,
            }}
          >
            {/* Banner */}
            {store.background_url && (
              <div className="relative w-full" style={{ height: 100 }}>
                <Image src={store.background_url} alt="Background" fill className="object-cover" />
              </div>
            )}

            {/* Header */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar */}
                <div
                  className="relative rounded-full shrink-0 overflow-hidden"
                  style={{ width: 48, height: 48, backgroundColor: store.card_color }}
                >
                  {store.avatar_url ? (
                    <Image src={store.avatar_url} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-lg" style={{ color: store.text_color, opacity: 0.5 }}>
                      {(store.display_name || handle).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: store.text_color }}>
                    {store.display_name || handle}
                  </p>
                  <p className="text-xs" style={{ color: store.text_color, opacity: 0.5 }}>
                    @{handle}
                  </p>
                  {store.location && (
                    <p className="text-xs" style={{ color: store.text_color, opacity: 0.5 }}>
                      {store.location}
                    </p>
                  )}
                </div>
              </div>
              {store.bio && (
                <p className="text-xs leading-relaxed" style={{ color: store.text_color, opacity: 0.7 }}>
                  {store.bio}
                </p>
              )}
            </div>

            {/* Social links */}
            {filledLinks.length > 0 && (
              <div className="px-5 pb-3 flex flex-wrap gap-2">
                {filledLinks.map(link => (
                  <span
                    key={link.id}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: store.card_color,
                      color: store.text_color,
                      border: `1px solid ${store.accent_color}22`,
                    }}
                  >
                    {PLATFORM_LABELS[link.title] ?? link.title}
                  </span>
                ))}
              </div>
            )}

            {/* Upcoming releases */}
            {store.releases.length > 0 && (
              <div className="px-5 pb-3">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: store.text_color, opacity: 0.4 }}>
                  Upcoming
                </p>
                <div className="space-y-2">
                  {store.releases.map(r => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ backgroundColor: store.card_color }}
                    >
                      <div>
                        <p className="text-xs font-medium" style={{ color: store.text_color }}>{r.title}</p>
                        {r.release_date && (
                          <p className="text-xs" style={{ color: store.text_color, opacity: 0.5 }}>{r.release_date}</p>
                        )}
                      </div>
                      {r.presave_url && (
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: store.accent_color, color: '#000' }}
                        >
                          Pre-save
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pinned track */}
            {pinnedTrack && (
              <div className="px-5 pb-3">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: store.text_color, opacity: 0.4 }}>
                  Featured
                </p>
                <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: store.card_color }}>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#27272a' }}>
                      {pinnedTrack.cover_url ? (
                        <Image src={pinnedTrack.cover_url} alt={pinnedTrack.title} fill className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">♪</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: store.text_color }}>
                        {pinnedTrack.title}
                      </p>
                      {pinnedTrack.artist && (
                        <p className="text-xs truncate" style={{ color: store.text_color, opacity: 0.6 }}>
                          {pinnedTrack.artist}
                        </p>
                      )}
                    </div>
                    {pinnedTrack.has_audio !== false && (
                      <button
                        onClick={() => selectTrack(pinnedTrack)}
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs"
                        style={{ backgroundColor: store.accent_color, color: '#000' }}
                      >
                        {currentTrack?.id === pinnedTrack.id ? '‖' : '▶'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Track grid */}
            {otherTracks.length > 0 && (
              <div className="px-5 pb-24">
                {pinnedTrack && (
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: store.text_color, opacity: 0.4 }}>
                    Tracks
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {otherTracks.map(track => (
                    <div
                      key={track.id}
                      className="rounded-xl overflow-hidden"
                      style={{ backgroundColor: store.card_color }}
                    >
                      {/* Square cover */}
                      <div className="relative w-full aspect-square" style={{ backgroundColor: '#27272a' }}>
                        {track.cover_url ? (
                          <Image src={track.cover_url} alt={track.title} fill className="object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xl">♪</span>
                        )}
                        {track.has_audio !== false && (
                          <button
                            onClick={() => selectTrack(track)}
                            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition"
                            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                          >
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                              style={{ backgroundColor: store.accent_color, color: '#000' }}
                            >
                              {currentTrack?.id === track.id ? '‖' : '▶'}
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium truncate" style={{ color: store.text_color }}>
                          {track.title}
                        </p>
                        {track.artist && (
                          <p className="text-xs truncate" style={{ color: store.text_color, opacity: 0.6 }}>
                            {track.artist}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {store.tracks.length === 0 && filledLinks.length === 0 && store.releases.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-xs" style={{ color: store.text_color, opacity: 0.3 }}>
                  Add tracks and links to see your profile
                </p>
              </div>
            )}
          </div>

          {/* Mini sticky player bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-14 flex items-center px-4 gap-3"
            style={{
              backgroundColor: store.card_color,
              borderTop: `1px solid ${store.text_color}11`,
              borderRadius: '0 0 40px 40px',
            }}
          >
            {currentTrack ? (
              <>
                <div className="relative w-8 h-8 rounded overflow-hidden shrink-0" style={{ backgroundColor: '#27272a' }}>
                  {currentTrack.cover_url ? (
                    <Image src={currentTrack.cover_url} alt={currentTrack.title} fill className="object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">♪</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: store.text_color }}>
                    {currentTrack.title}
                  </p>
                </div>
                <span className="text-xs" style={{ color: store.accent_color }}>▶</span>
              </>
            ) : (
              <p className="text-xs w-full text-center" style={{ color: store.text_color, opacity: 0.3 }}>
                audio-links
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
