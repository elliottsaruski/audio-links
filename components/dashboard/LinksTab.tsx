'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/lib/dashboard-store'
import { saveLinks } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const PLATFORMS = [
  { id: 'spotify', label: 'Spotify' },
  { id: 'apple_music', label: 'Apple Music' },
  { id: 'soundcloud', label: 'SoundCloud' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'bandcamp', label: 'Bandcamp' },
  { id: 'website', label: 'Website' },
] as const

type PlatformId = typeof PLATFORMS[number]['id']

export default function LinksTab() {
  const router = useRouter()
  const links = useDashboardStore(s => s.links)

  // Local URL map: platformId → url
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [order, setOrder] = useState<PlatformId[]>(PLATFORMS.map(p => p.id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const dragId = useRef<PlatformId | null>(null)

  // Sync local draft state from external store when links change.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(function syncFromStore() {
    const map: Record<string, string> = {}
    links.forEach(l => { map[l.title] = l.url })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrls(map)

    // Put platforms with URLs first in the order, respecting sort_order
    const withUrl = [...links]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(l => l.title as PlatformId)
      .filter(id => PLATFORMS.some(p => p.id === id))

    const rest = PLATFORMS.map(p => p.id).filter(id => !withUrl.includes(id))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder([...withUrl, ...rest])
  }, [links])

  function setUrl(id: string, url: string) {
    setUrls(prev => ({ ...prev, [id]: url }))
  }

  // Drag to reorder (only meaningful for filled platforms)
  function onDragStart(id: PlatformId) {
    dragId.current = id
  }

  function onDragOver(e: React.DragEvent, targetId: PlatformId) {
    e.preventDefault()
    if (!dragId.current || dragId.current === targetId) return
    const from = order.indexOf(dragId.current)
    const to = order.indexOf(targetId)
    if (from === -1 || to === -1) return
    const next = [...order]
    next.splice(from, 1)
    next.splice(to, 0, dragId.current)
    setOrder(next)
  }

  function onDrop() {
    dragId.current = null
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const filled = order
      .filter(id => urls[id]?.trim())
      .map((id, i) => ({ platform: id, url: urls[id]!.trim(), sort_order: i }))

    const { error } = await saveLinks(filled)
    setSaving(false)

    if (error) {
      setError(error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-500">
        Fill in the platforms you use. Leave blank to hide. Drag to reorder.
      </p>

      <div className="space-y-2">
        {order.map(id => {
          const platform = PLATFORMS.find(p => p.id === id)
          if (!platform) return null
          const hasFill = !!urls[id]?.trim()

          return (
            <div
              key={id}
              draggable={hasFill}
              onDragStart={() => hasFill && onDragStart(id)}
              onDragOver={e => onDragOver(e, id)}
              onDrop={onDrop}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
                hasFill
                  ? 'border-zinc-700 bg-zinc-900 cursor-grab active:cursor-grabbing'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              {/* Drag handle - only for filled platforms */}
              <span className={`text-xs select-none shrink-0 w-3 ${hasFill ? 'text-zinc-600' : 'text-transparent'}`}>
                ⠿
              </span>

              <span className="text-sm text-zinc-400 w-28 shrink-0">{platform.label}</span>

              <Input
                value={urls[id] ?? ''}
                onChange={e => setUrl(id, e.target.value)}
                placeholder="https://…"
                type="url"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 text-sm h-7 flex-1"
              />
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save links'}
      </Button>
    </div>
  )
}
