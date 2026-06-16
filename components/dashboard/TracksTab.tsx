'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDashboardStore, TrackLink } from '@/lib/dashboard-store'
import { addTrack, updateTrack, deleteTrack, setPinnedTrack, reorderTracks } from '@/app/dashboard/actions'
import { uploadFile } from '@/lib/upload'
import { extractPeaks } from '@/lib/peaks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tables } from '@/types/database'

type Track = Tables<'tracks'>

const MAX_TRACKS = 10

const TRACK_PLATFORMS: Array<{ id: TrackLink['platform']; label: string }> = [
  { id: 'spotify', label: 'Spotify' },
  { id: 'apple_music', label: 'Apple Music' },
  { id: 'tidal', label: 'Tidal' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'soundcloud', label: 'SoundCloud' },
  { id: 'bandcamp', label: 'Bandcamp' },
]

interface TrackFormState {
  title: string
  artist: string
  hasAudio: boolean
  description: string
  releaseDate: string
  isPinned: boolean
  platformUrls: Record<string, string>
  audioFile: File | null
  coverFile: File | null
}

const emptyForm = (): TrackFormState => ({
  title: '',
  artist: '',
  hasAudio: true,
  description: '',
  releaseDate: '',
  isPinned: false,
  platformUrls: {},
  audioFile: null,
  coverFile: null,
})

function formFromTrack(track: Track): TrackFormState {
  const links = (track.track_links as TrackLink[] | null) ?? []
  const platformUrls: Record<string, string> = {}
  links.forEach(l => { platformUrls[l.platform] = l.url })

  return {
    title: track.title,
    artist: track.artist ?? '',
    hasAudio: track.has_audio ?? true,
    description: track.description ?? '',
    releaseDate: track.release_date ?? '',
    isPinned: track.is_pinned ?? false,
    platformUrls,
    audioFile: null,
    coverFile: null,
  }
}

export default function TracksTab({ userId }: { userId: string }) {
  const router = useRouter()
  const tracks = useDashboardStore(s => s.tracks)
  const setTracks = useDashboardStore(s => s.setTracks)

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [form, setForm] = useState<TrackFormState>(emptyForm())
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<Track | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const atCap = tracks.length >= MAX_TRACKS

  function openAdd() {
    setForm(emptyForm())
    setEditingTrack(null)
    setUploadError(null)
    setMode('add')
  }

  function openEdit(track: Track) {
    setForm(formFromTrack(track))
    setEditingTrack(track)
    setUploadError(null)
    setMode('edit')
  }

  function closeForm() {
    setMode('list')
    setEditingTrack(null)
    if (audioInputRef.current) audioInputRef.current.value = ''
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  function setField<K extends keyof TrackFormState>(k: K, v: TrackFormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function setPlatformUrl(platform: string, url: string) {
    setForm(f => ({ ...f, platformUrls: { ...f.platformUrls, [platform]: url } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    if (mode === 'add' && form.hasAudio && !form.audioFile) return

    setUploading(true)
    setUploadError(null)

    try {
      let audioUrl: string | null = null
      let peaks: number[] | undefined
      let coverUrl: string | null = editingTrack?.cover_url ?? null

      if (form.audioFile) {
        setUploadStatus('Extracting waveform…')
        peaks = await extractPeaks(form.audioFile)
        setUploadStatus('Uploading audio…')
        audioUrl = await uploadFile('audio', userId, form.audioFile)
      }

      if (form.coverFile) {
        setUploadStatus('Uploading cover…')
        coverUrl = await uploadFile('covers', userId, form.coverFile)
      }

      const trackLinks: TrackLink[] = TRACK_PLATFORMS
        .filter(p => form.platformUrls[p.id]?.trim())
        .map(p => ({ platform: p.id, url: form.platformUrls[p.id]!.trim() }))

      const payload = {
        title: form.title.trim(),
        artist: form.artist.trim() || null,
        has_audio: form.hasAudio,
        audio_url: audioUrl ?? (editingTrack?.audio_url ?? null),
        cover_url: coverUrl,
        waveform_peaks: peaks ?? (editingTrack?.waveform_peaks ?? null),
        description: form.description.trim() || null,
        release_date: form.releaseDate || null,
        track_links: trackLinks,
        is_pinned: form.isPinned,
      }

      setUploadStatus('Saving…')

      let result: { error?: string }
      if (mode === 'edit' && editingTrack) {
        // Handle pin change: if pinning, unpin others first
        if (form.isPinned && !editingTrack.is_pinned) {
          await setPinnedTrack(editingTrack.id)
        } else if (!form.isPinned && editingTrack.is_pinned) {
          await setPinnedTrack(null)
        }
        result = await updateTrack(editingTrack.id, payload)
      } else {
        if (form.isPinned) {
          await setPinnedTrack(null) // unpin all before adding pinned
        }
        result = await addTrack(payload)
      }

      if (result.error) {
        setUploadError(result.error)
      } else {
        closeForm()
        router.refresh()
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadStatus('')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteTrack(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    router.refresh()
  }

  // Drag-to-reorder
  function onDragStart(index: number) {
    setDragIndex(index)
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const reordered = [...tracks]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved!)
    setTracks(reordered)
    setDragIndex(index)
  }

  async function onDrop() {
    setDragIndex(null)
    await reorderTracks(tracks.map(t => t.id))
  }

  if (mode === 'add' || mode === 'edit') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={closeForm} className="text-zinc-500 hover:text-white text-sm">
            ← Back
          </button>
          <h2 className="text-sm font-medium text-white">
            {mode === 'add' ? 'Add track' : 'Edit track'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Title *</Label>
            <Input
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              required
              placeholder="Track title"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Artist</Label>
            <Input
              value={form.artist}
              onChange={e => setField('artist', e.target.value)}
              placeholder="Artist name"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Has audio toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setField('hasAudio', !form.hasAudio)}
              className={`w-9 h-5 rounded-full transition relative ${form.hasAudio ? 'bg-white' : 'bg-zinc-700'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-900 transition-all ${form.hasAudio ? 'left-4' : 'left-0.5'}`}
              />
            </div>
            <span className="text-sm text-zinc-300">This track has an audio file</span>
          </label>

          {form.hasAudio && (
            <div className="space-y-2">
              <Label className="text-zinc-300">
                Audio file {mode === 'add' ? '*' : '(leave blank to keep existing)'}
              </Label>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg,audio/flac"
                required={mode === 'add'}
                onChange={e => setField('audioFile', e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-zinc-300">Cover art (leave blank to keep existing)</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={e => setField('coverFile', e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Description</Label>
            <Textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Optional track description…"
              rows={2}
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Release date</Label>
            <Input
              type="date"
              value={form.releaseDate}
              onChange={e => setField('releaseDate', e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Streaming links */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Streaming links</Label>
            <div className="space-y-2">
              {TRACK_PLATFORMS.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-24 shrink-0">{p.label}</span>
                  <Input
                    value={form.platformUrls[p.id] ?? ''}
                    onChange={e => setPlatformUrl(p.id, e.target.value)}
                    placeholder="https://…"
                    type="url"
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pin toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setField('isPinned', !form.isPinned)}
              className={`w-9 h-5 rounded-full transition relative ${form.isPinned ? 'bg-yellow-400' : 'bg-zinc-700'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-900 transition-all ${form.isPinned ? 'left-4' : 'left-0.5'}`}
              />
            </div>
            <span className="text-sm text-zinc-300">Pin this track to the top of your profile</span>
          </label>

          {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
          {uploadStatus && <p className="text-sm text-zinc-500">{uploadStatus}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={uploading || !form.title.trim() || (mode === 'add' && form.hasAudio && !form.audioFile)}
            >
              {uploading ? (uploadStatus || 'Uploading…') : mode === 'add' ? 'Add track' : 'Save changes'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={closeForm} className="text-zinc-400">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{tracks.length} / {MAX_TRACKS} tracks</span>
        {!atCap && (
          <Button size="sm" variant="outline" onClick={openAdd} className="border-zinc-700 text-zinc-300 hover:text-white">
            + Add track
          </Button>
        )}
      </div>

      {/* Track list */}
      <div className="space-y-2">
        {tracks.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">No tracks yet.</p>
        )}
        {tracks.map((track, i) => (
          <div
            key={track.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={e => onDragOver(e, i)}
            onDrop={onDrop}
            className={`flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 cursor-grab active:cursor-grabbing transition ${dragIndex === i ? 'opacity-50' : ''}`}
          >
            {/* Drag handle */}
            <span className="text-zinc-700 text-xs select-none shrink-0">⠿</span>

            {/* Cover thumbnail */}
            <div className="w-9 h-9 rounded bg-zinc-800 shrink-0 overflow-hidden">
              {track.cover_url ? (
                <Image src={track.cover_url} alt={track.title} width={36} height={36} className="object-cover w-full h-full" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">♪</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {track.is_pinned && <span className="text-yellow-400 text-xs">★</span>}
                {!track.has_audio && <span className="text-zinc-600 text-xs" title="No audio">◻</span>}
                <p className="text-sm font-medium text-white truncate">{track.title}</p>
              </div>
              {track.artist && <p className="text-xs text-zinc-500 truncate">{track.artist}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => openEdit(track)}
                className="p-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition"
              >
                Edit
              </button>
              <button
                onClick={() => setDeleteTarget(track)}
                className="p-1.5 text-xs text-zinc-600 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {atCap && (
        <p className="text-xs text-zinc-500 text-center">Track limit reached. Delete a track to add another.</p>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-white font-medium">Delete &ldquo;{deleteTarget.title}&rdquo;?</p>
            <p className="text-sm text-zinc-400">This can&apos;t be undone.</p>
            <div className="flex gap-3">
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(null)} className="text-zinc-400">
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
