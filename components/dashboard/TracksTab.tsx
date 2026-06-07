'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Tables } from '@/types/database'
import { addTrack, deleteTrack, setPinnedTrack } from '@/app/dashboard/actions'
import { uploadFile } from '@/lib/upload'
import { extractPeaks } from '@/lib/peaks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Track = Tables<'tracks'>

const MAX_TRACKS = 10

export default function TracksTab({ tracks, userId }: { tracks: Track[]; userId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pinningId, setPinningId] = useState<string | null>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const atCap = tracks.length >= MAX_TRACKS

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!audioFile || !title.trim()) return
    setUploading(true)
    setUploadError(null)

    try {
      setUploadStatus('Extracting waveform…')
      const peaks = await extractPeaks(audioFile)

      setUploadStatus('Uploading audio…')
      const audioUrl = await uploadFile('audio', userId, audioFile)

      let coverUrl: string | null = null
      if (coverFile) {
        setUploadStatus('Uploading cover…')
        coverUrl = await uploadFile('covers', userId, coverFile)
      }

      setUploadStatus('Saving…')
      const { error } = await addTrack({
        title: title.trim(),
        artist: artist.trim() || null,
        audio_url: audioUrl,
        cover_url: coverUrl,
        waveform_peaks: peaks,
      })

      if (error) {
        setUploadError(error)
      } else {
        setTitle('')
        setArtist('')
        setAudioFile(null)
        setCoverFile(null)
        if (audioInputRef.current) audioInputRef.current.value = ''
        if (coverInputRef.current) coverInputRef.current.value = ''
        setShowForm(false)
        router.refresh()
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setUploadStatus('')
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteTrack(id)
    setDeletingId(null)
    router.refresh()
  }

  async function handlePin(track: Track) {
    setPinningId(track.id)
    await setPinnedTrack(track.is_pinned ? null : track.id)
    setPinningId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          {tracks.length} / {MAX_TRACKS} tracks
        </span>
        {!atCap && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(v => !v)}
            className="border-zinc-700 text-zinc-300 hover:text-white"
          >
            {showForm ? 'Cancel' : '+ Add track'}
          </Button>
        )}
      </div>

      {/* Upload form */}
      {showForm && (
        <form
          onSubmit={handleUpload}
          className="border border-zinc-800 rounded-lg p-4 space-y-4 bg-zinc-900"
        >
          <div className="space-y-2">
            <Label className="text-zinc-300">Title *</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="Track title"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Artist</Label>
            <Input
              value={artist}
              onChange={e => setArtist(e.target.value)}
              placeholder="Artist name"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Audio file *</Label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg,audio/flac"
              required
              onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Cover image</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={e => setCoverFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300 hover:file:bg-zinc-600"
            />
          </div>

          {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
          {uploadStatus && <p className="text-sm text-zinc-500">{uploadStatus}</p>}

          <Button type="submit" disabled={uploading || !audioFile || !title.trim()} className="w-full">
            {uploading ? uploadStatus || 'Uploading…' : 'Upload track'}
          </Button>
        </form>
      )}

      {/* Track list */}
      <div className="space-y-2">
        {tracks.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">No tracks yet.</p>
        )}
        {tracks.map(track => (
          <div
            key={track.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            {/* Cover thumbnail */}
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
                <span className="w-full h-full flex items-center justify-center text-zinc-600 text-lg">
                  ♪
                </span>
              )}
            </div>

            {/* Title + artist */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{track.title}</p>
              {track.artist && (
                <p className="text-xs text-zinc-500 truncate">{track.artist}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handlePin(track)}
                disabled={pinningId === track.id}
                title={track.is_pinned ? 'Unpin' : 'Pin'}
                className={`p-1.5 rounded text-sm transition ${
                  track.is_pinned
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-zinc-600 hover:text-zinc-300'
                }`}
              >
                ★
              </button>
              <button
                onClick={() => handleDelete(track.id)}
                disabled={deletingId === track.id}
                title="Delete"
                className="p-1.5 rounded text-zinc-600 hover:text-red-400 transition text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {atCap && (
        <p className="text-xs text-zinc-500 text-center">
          Track limit reached. Delete a track to add another.
        </p>
      )}
    </div>
  )
}
